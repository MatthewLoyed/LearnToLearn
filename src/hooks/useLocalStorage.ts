'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface StorageOptions {
    encrypt?: boolean;
    compress?: boolean;
    version?: number;
    maxSize?: number; // in bytes
    fallback?: 'memory' | 'session' | 'none';
}

export interface StorageData<T> {
    data: T;
    version: number;
    timestamp: number;
    checksum: string;
}

export interface StorageError {
    type: 'quota_exceeded' | 'encryption_failed' | 'compression_failed' | 'corruption' | 'version_mismatch';
    message: string;
    originalError?: Error;
}

export interface UseLocalStorageReturn<T> {
    value: T | null;
    setValue: (value: T) => void;
    removeValue: () => void;
    clearAll: () => void;
    error: StorageError | null;
    isLoading: boolean;
    isPersisted: boolean;
    size: number; // in bytes
    lastUpdated: number | null;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const DEFAULT_OPTIONS: Required<StorageOptions> = {
    encrypt: false,
    compress: true,
    version: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    fallback: 'memory'
};

const STORAGE_PREFIX = 'skill_forge_';
const ENCRYPTION_KEY = 'skill_forge_encryption_key_2024'; // In production, use environment variable
const COMPRESSION_THRESHOLD = 1024; // Compress data larger than 1KB

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a simple checksum for data integrity
 */
function generate_checksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

/**
 * Simple encryption using XOR cipher (for demo purposes)
 * In production, use a proper encryption library like crypto-js
 */
function encrypt_data(data: string): string {
    if (!data) return data;
    
    try {
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            encrypted += String.fromCharCode(charCode);
        }
        return btoa(encrypted); // Base64 encode
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * Simple decryption using XOR cipher
 */
function decrypt_data(encryptedData: string): string {
    if (!encryptedData) return encryptedData;
    
    try {
        const decoded = atob(encryptedData); // Base64 decode
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Decryption failed');
    }
}

/**
 * Simple compression using JSON.stringify optimization
 */
function compress_data(data: string): string {
    if (data.length < COMPRESSION_THRESHOLD) return data;
    
    try {
        // Remove unnecessary whitespace and use shorter property names
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed);
    } catch (error) {
        console.warn('Compression failed, using original data:', error);
        return data;
    }
}

/**
 * Decompress data (reverse of compression)
 */
function decompress_data(data: string): string {
    try {
        // For now, compression is just JSON optimization, so no special decompression needed
        return data;
    } catch (error) {
        console.warn('Decompression failed, using original data:', error);
        return data;
    }
}

/**
 * Check if localStorage is available and working
 */
function is_local_storage_available(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get storage size in bytes
 */
function get_storage_size(key: string): number {
    try {
        const item = localStorage.getItem(key);
        return item ? new Blob([item]).size : 0;
    } catch {
        return 0;
    }
}

/**
 * Check if storage quota is exceeded
 */
function is_quota_exceeded(error: Error): boolean {
    return error.name === 'QuotaExceededError' || 
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
           error.message.includes('quota');
}

// ============================================================================
// MEMORY STORAGE FALLBACK
// ============================================================================

const memoryStorage = new Map<string, string>();

function get_memory_storage(key: string): string | null {
    return memoryStorage.get(key) || null;
}

function set_memory_storage(key: string, value: string): void {
    memoryStorage.set(key, value);
}

function remove_memory_storage(key: string): void {
    memoryStorage.delete(key);
}

function clear_memory_storage(): void {
    memoryStorage.clear();
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function use_local_storage<T>(
    key: string,
    initialValue: T | null = null,
    options: StorageOptions = {}
): UseLocalStorageReturn<T> {
    // Merge options with defaults
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    // State management
    const [value, set_value] = useState<T | null>(initialValue);
    const [error, set_error] = useState<StorageError | null>(null);
    const [isLoading, set_is_loading] = useState(true);
    const [isPersisted, set_is_persisted] = useState(false);
    const [size, set_size] = useState(0);
    const [lastUpdated, set_last_updated] = useState<number | null>(null);
    
    // Refs for tracking
    const storageKey = useRef(`${STORAGE_PREFIX}${key}`);
    const isInitialized = useRef(false);
    const fallbackMode = useRef<'localStorage' | 'memory' | 'session'>('localStorage');

    // ============================================================================
    // STORAGE OPERATIONS
    // ============================================================================

    /**
     * Read data from storage with error handling and fallbacks
     */
    const read_from_storage = useCallback((): T | null => {
        const fullKey = storageKey.current;
        
        try {
            let rawData: string | null = null;
            
            // Try localStorage first
            if (fallbackMode.current === 'localStorage' && is_local_storage_available()) {
                rawData = localStorage.getItem(fullKey);
            }
            
            // Fallback to memory storage
            if (!rawData && (fallbackMode.current === 'memory' || config.fallback === 'memory')) {
                rawData = get_memory_storage(fullKey);
                fallbackMode.current = 'memory';
            }
            
            // Fallback to sessionStorage
            if (!rawData && config.fallback === 'session') {
                rawData = sessionStorage.getItem(fullKey);
                fallbackMode.current = 'session';
            }
            
            if (!rawData) return null;
            
            // Decrypt if needed
            if (config.encrypt) {
                try {
                    rawData = decrypt_data(rawData);
                } catch (error) {
                    console.error('Decryption failed:', error);
                    set_error({
                        type: 'encryption_failed',
                        message: 'Failed to decrypt stored data',
                        originalError: error as Error
                    });
                    return null;
                }
            }
            
            // Decompress if needed
            if (config.compress) {
                try {
                    rawData = decompress_data(rawData);
                } catch (error) {
                    console.error('Decompression failed:', error);
                    set_error({
                        type: 'compression_failed',
                        message: 'Failed to decompress stored data',
                        originalError: error as Error
                    });
                    return null;
                }
            }
            
            // Parse the data
            const parsed: StorageData<T> = JSON.parse(rawData);
            
            // Validate checksum
            const expectedChecksum = generate_checksum(JSON.stringify(parsed.data));
            if (parsed.checksum !== expectedChecksum) {
                console.error('Data corruption detected');
                set_error({
                    type: 'corruption',
                    message: 'Stored data appears to be corrupted'
                });
                return null;
            }
            
            // Check version compatibility
            if (parsed.version !== config.version) {
                console.warn(`Version mismatch: stored=${parsed.version}, expected=${config.version}`);
                set_error({
                    type: 'version_mismatch',
                    message: `Data version mismatch: stored=${parsed.version}, expected=${config.version}`
                });
                // For now, return the data anyway, but log the warning
            }
            
            set_last_updated(parsed.timestamp);
            set_is_persisted(true);
            return parsed.data;
            
        } catch (error) {
            console.error('Failed to read from storage:', error);
            set_error({
                type: 'corruption',
                message: 'Failed to read stored data',
                originalError: error as Error
            });
            return null;
        }
    }, [config]);

    /**
     * Write data to storage with error handling and fallbacks
     */
    const write_to_storage = useCallback((newValue: T): void => {
        const fullKey = storageKey.current;
        
        try {
            // Prepare storage data
            const storageData: StorageData<T> = {
                data: newValue,
                version: config.version,
                timestamp: Date.now(),
                checksum: generate_checksum(JSON.stringify(newValue))
            };
            
            let dataToStore = JSON.stringify(storageData);
            
            // Compress if needed
            if (config.compress) {
                try {
                    dataToStore = compress_data(dataToStore);
                } catch (error) {
                    console.warn('Compression failed, using uncompressed data:', error);
                    set_error({
                        type: 'compression_failed',
                        message: 'Failed to compress data',
                        originalError: error as Error
                    });
                }
            }
            
            // Encrypt if needed
            if (config.encrypt) {
                try {
                    dataToStore = encrypt_data(dataToStore);
                } catch (error) {
                    console.error('Encryption failed:', error);
                    set_error({
                        type: 'encryption_failed',
                        message: 'Failed to encrypt data',
                        originalError: error as Error
                    });
                    return;
                }
            }
            
            // Check size limit
            const dataSize = new Blob([dataToStore]).size;
            if (dataSize > config.maxSize) {
                console.error('Data size exceeds limit:', dataSize, '>', config.maxSize);
                set_error({
                    type: 'quota_exceeded',
                    message: `Data size (${dataSize} bytes) exceeds limit (${config.maxSize} bytes)`
                });
                return;
            }
            
            // Try to write to storage
            let writeSuccess = false;
            
            // Try localStorage first
            if (fallbackMode.current === 'localStorage' && is_local_storage_available()) {
                try {
                    localStorage.setItem(fullKey, dataToStore);
                    writeSuccess = true;
                } catch (error) {
                    if (is_quota_exceeded(error as Error)) {
                        console.warn('localStorage quota exceeded, trying fallback');
                        fallbackMode.current = 'memory';
                    } else {
                        throw error;
                    }
                }
            }
            
            // Fallback to memory storage
            if (!writeSuccess && (fallbackMode.current === 'memory' || config.fallback === 'memory')) {
                set_memory_storage(fullKey, dataToStore);
                writeSuccess = true;
                fallbackMode.current = 'memory';
            }
            
            // Fallback to sessionStorage
            if (!writeSuccess && config.fallback === 'session') {
                sessionStorage.setItem(fullKey, dataToStore);
                writeSuccess = true;
                fallbackMode.current = 'session';
            }
            
            if (writeSuccess) {
                set_size(dataSize);
                set_last_updated(storageData.timestamp);
                set_is_persisted(true);
                set_error(null);
            } else {
                throw new Error('All storage methods failed');
            }
            
        } catch (error) {
            console.error('Failed to write to storage:', error);
            set_error({
                type: 'quota_exceeded',
                message: 'Failed to write data to storage',
                originalError: error as Error
            });
        }
    }, [config]);

    /**
     * Remove data from storage
     */
    const remove_from_storage = useCallback((): void => {
        const fullKey = storageKey.current;
        
        try {
            // Try all storage methods
            if (is_local_storage_available()) {
                localStorage.removeItem(fullKey);
            }
            remove_memory_storage(fullKey);
            sessionStorage.removeItem(fullKey);
            
            set_size(0);
            set_last_updated(null);
            set_is_persisted(false);
            set_error(null);
            
        } catch (error) {
            console.error('Failed to remove from storage:', error);
            set_error({
                type: 'corruption',
                message: 'Failed to remove data from storage',
                originalError: error as Error
            });
        }
    }, []);

    /**
     * Clear all storage data
     */
    const clear_all_storage = useCallback((): void => {
        try {
            // Clear localStorage items with our prefix
            if (is_local_storage_available()) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(STORAGE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
            }
            
            // Clear memory storage
            clear_memory_storage();
            
            // Clear sessionStorage items with our prefix
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    sessionStorage.removeItem(key);
                }
            });
            
            set_size(0);
            set_last_updated(null);
            set_is_persisted(false);
            set_error(null);
            
        } catch (error) {
            console.error('Failed to clear storage:', error);
            set_error({
                type: 'corruption',
                message: 'Failed to clear storage',
                originalError: error as Error
            });
        }
    }, []);

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    const setValue = useCallback((newValue: T): void => {
        set_value(newValue);
        write_to_storage(newValue);
    }, [write_to_storage]);

    const removeValue = useCallback((): void => {
        set_value(null);
        remove_from_storage();
    }, [remove_from_storage]);

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    useEffect(() => {
        if (isInitialized.current) return;
        
        try {
            // Initialize storage mode
            if (!is_local_storage_available()) {
                fallbackMode.current = config.fallback === 'memory' ? 'memory' : 'session';
            }
            
            // Load initial value
            const storedValue = read_from_storage();
            if (storedValue !== null) {
                set_value(storedValue);
            }
            
            // Update size
            if (fallbackMode.current === 'localStorage') {
                set_size(get_storage_size(storageKey.current));
            }
            
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            set_error({
                type: 'corruption',
                message: 'Failed to initialize storage',
                originalError: error as Error
            });
        } finally {
            set_is_loading(false);
            isInitialized.current = true;
        }
    }, [read_from_storage, config.fallback]);

    // ============================================================================
    // STORAGE EVENT LISTENING (for cross-tab synchronization)
    // ============================================================================

    useEffect(() => {
        if (!is_local_storage_available()) return;
        
        const handle_storage_change = (event: StorageEvent) => {
            if (event.key === storageKey.current && event.newValue !== null) {
                try {
                    const newValue = read_from_storage();
                    if (newValue !== null) {
                        set_value(newValue);
                    }
                } catch (error) {
                    console.error('Failed to sync storage change:', error);
                }
            }
        };
        
        window.addEventListener('storage', handle_storage_change);
        
        return () => {
            window.removeEventListener('storage', handle_storage_change);
        };
    }, [read_from_storage]);

    // ============================================================================
    // RETURN VALUE
    // ============================================================================

    return {
        value,
        setValue,
        removeValue,
        clearAll: clear_all_storage,
        error,
        isLoading,
        isPersisted,
        size,
        lastUpdated
    };
}

// ============================================================================
// UTILITY FUNCTIONS FOR EXTERNAL USE
// ============================================================================

/**
 * Get total storage size for all Skill Forge data
 */
export function get_total_storage_size(): number {
    if (!is_local_storage_available()) return 0;
    
    try {
        let totalSize = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                totalSize += get_storage_size(key);
            }
        });
        
        return totalSize;
    } catch {
        return 0;
    }
}

/**
 * Get storage statistics
 */
export function get_storage_stats(): {
    totalSize: number;
    itemCount: number;
    available: boolean;
    fallbackMode: string;
} {
    const available = is_local_storage_available();
    const totalSize = get_total_storage_size();
    
    let itemCount = 0;
    if (available) {
        const keys = Object.keys(localStorage);
        itemCount = keys.filter(key => key.startsWith(STORAGE_PREFIX)).length;
    }
    
    return {
        totalSize,
        itemCount,
        available,
        fallbackMode: available ? 'localStorage' : 'memory'
    };
}

/**
 * Migrate data from old format to new format
 */
export function migrate_storage_data<T>(
    key: string,
    migrationFn: (oldData: any) => T,
    version: number
): boolean {
    try {
        const fullKey = `${STORAGE_PREFIX}${key}`;
        const oldData = localStorage.getItem(fullKey);
        
        if (!oldData) return false;
        
        const parsed = JSON.parse(oldData);
        if (parsed.version === version) return false; // Already up to date
        
        // Migrate the data
        const migratedData = migrationFn(parsed.data);
        
        // Store with new version
        const newStorageData: StorageData<T> = {
            data: migratedData,
            version,
            timestamp: Date.now(),
            checksum: generate_checksum(JSON.stringify(migratedData))
        };
        
        localStorage.setItem(fullKey, JSON.stringify(newStorageData));
        return true;
        
    } catch (error) {
        console.error('Migration failed:', error);
        return false;
    }
}
