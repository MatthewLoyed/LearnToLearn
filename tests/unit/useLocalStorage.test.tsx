import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { use_local_storage, get_total_storage_size, get_storage_stats, migrate_storage_data } from './useLocalStorage';

// ============================================================================
// TEST UTILITIES
// ============================================================================

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0
};

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0
};

// Mock window.btoa and atob for encryption
const btoaMock = jest.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));
const atobMock = jest.fn((str: string) => Buffer.from(str, 'base64').toString('binary'));

// Test component to access hook
function TestComponent({ 
    key, 
    initialValue, 
    options = {} 
}: { 
    key: string; 
    initialValue?: any; 
    options?: any; 
}) {
    const storage = use_local_storage(key, initialValue, options);
    
    return (
        <div>
            <div data-testid="value">{JSON.stringify(storage.value)}</div>
            <div data-testid="error">{storage.error?.message || 'no-error'}</div>
            <div data-testid="loading">{storage.isLoading.toString()}</div>
            <div data-testid="persisted">{storage.isPersisted.toString()}</div>
            <div data-testid="size">{storage.size}</div>
            <div data-testid="last-updated">{storage.lastUpdated || 'null'}</div>
            <button 
                data-testid="set-value"
                onClick={() => storage.setValue({ test: 'data', timestamp: Date.now() })}
            >
                Set Value
            </button>
            <button 
                data-testid="remove-value"
                onClick={() => storage.removeValue()}
            >
                Remove Value
            </button>
            <button 
                data-testid="clear-all"
                onClick={() => storage.clearAll()}
            >
                Clear All
            </button>
        </div>
    );
}

// ============================================================================
// TEST SETUP
// ============================================================================

describe('useLocalStorage', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup localStorage mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        
        // Setup sessionStorage mock
        Object.defineProperty(window, 'sessionStorage', {
            value: sessionStorageMock,
            writable: true
        });
        
        // Setup btoa/atob mocks
        Object.defineProperty(window, 'btoa', {
            value: btoaMock,
            writable: true
        });
        Object.defineProperty(window, 'atob', {
            value: atobMock,
            writable: true
        });
        
        // Reset memory storage
        const memoryStorage = new Map();
        jest.doMock('./useLocalStorage', () => ({
            ...jest.requireActual('./useLocalStorage'),
            memoryStorage
        }));
    });

    // ============================================================================
    // BASIC FUNCTIONALITY TESTS
    // ============================================================================

    describe('Basic Functionality', () => {
        it('should initialize with null value when no data exists', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            render(<TestComponent key="test-key" />);
            
            expect(screen.getByTestId('value').textContent).toBe('null');
            expect(screen.getByTestId('loading').textContent).toBe('false');
            expect(screen.getByTestId('persisted').textContent).toBe('false');
        });

        it('should initialize with provided initial value', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            render(<TestComponent key="test-key" initialValue={{ test: 'initial' }} />);
            
            expect(screen.getByTestId('value').textContent).toBe('{"test":"initial"}');
        });

        it('should load existing data from localStorage', () => {
            const mockData = {
                data: { test: 'stored-data' },
                version: 1,
                timestamp: 1234567890,
                checksum: 'abc123'
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
            
            render(<TestComponent key="test-key" />);
            
            expect(screen.getByTestId('value').textContent).toBe('{"test":"stored-data"}');
            expect(screen.getByTestId('persisted').textContent).toBe('true');
            expect(screen.getByTestId('last-updated').textContent).toBe('1234567890');
        });

        it('should set and persist new value', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
            
            expect(screen.getByTestId('persisted').textContent).toBe('true');
        });

        it('should remove value from storage', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.removeItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" />);
            
            fireEvent.click(screen.getByTestId('remove-value'));
            
            await waitFor(() => {
                expect(localStorageMock.removeItem).toHaveBeenCalled();
            });
            
            expect(screen.getByTestId('value').textContent).toBe('null');
            expect(screen.getByTestId('persisted').textContent).toBe('false');
        });
    });

    // ============================================================================
    // ENCRYPTION TESTS
    // ============================================================================

    describe('Encryption', () => {
        it('should encrypt data when encryption is enabled', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" options={{ encrypt: true }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
                const storedData = localStorageMock.setItem.mock.calls[0][1];
                expect(storedData).not.toContain('test');
                expect(storedData).not.toContain('data');
            });
        });

        it('should decrypt data when reading encrypted data', () => {
            const encryptedData = btoaMock('encrypted-content');
            const mockData = {
                data: { test: 'encrypted-data' },
                version: 1,
                timestamp: 1234567890,
                checksum: 'abc123'
            };
            
            // Mock the encrypted data
            localStorageMock.getItem.mockReturnValue(encryptedData);
            
            render(<TestComponent key="test-key" options={{ encrypt: true }} />);
            
            expect(screen.getByTestId('value').textContent).toBe('{"test":"encrypted-data"}');
        });

        it('should handle encryption errors gracefully', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Encryption failed');
            });
            
            render(<TestComponent key="test-key" options={{ encrypt: true }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(screen.getByTestId('error').textContent).toContain('Failed to encrypt data');
            });
        });
    });

    // ============================================================================
    // COMPRESSION TESTS
    // ============================================================================

    describe('Compression', () => {
        it('should compress large data when compression is enabled', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            const largeData = { 
                largeArray: new Array(1000).fill('test-data'),
                timestamp: Date.now()
            };
            
            render(<TestComponent key="test-key" options={{ compress: true }} />);
            
            // Set large data
            act(() => {
                const setValueButton = screen.getByTestId('set-value');
                fireEvent.click(setValueButton);
            });
            
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
        });

        it('should not compress small data', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" options={{ compress: true }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
        });
    });

    // ============================================================================
    // ERROR HANDLING TESTS
    // ============================================================================

    describe('Error Handling', () => {
        it('should handle localStorage quota exceeded', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            });
            
            render(<TestComponent key="test-key" options={{ fallback: 'memory' }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(screen.getByTestId('error').textContent).toBe('no-error');
            });
        });

        it('should handle data corruption', () => {
            localStorageMock.getItem.mockReturnValue('corrupted-data');
            
            render(<TestComponent key="test-key" />);
            
            expect(screen.getByTestId('error').textContent).toContain('Failed to read stored data');
        });

        it('should handle version mismatch', () => {
            const mockData = {
                data: { test: 'old-data' },
                version: 0, // Old version
                timestamp: 1234567890,
                checksum: 'abc123'
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
            
            render(<TestComponent key="test-key" options={{ version: 2 }} />);
            
            expect(screen.getByTestId('error').textContent).toContain('version mismatch');
        });

        it('should handle localStorage not available', () => {
            // Mock localStorage as unavailable
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: () => { throw new Error('localStorage not available'); },
                    setItem: () => { throw new Error('localStorage not available'); },
                    removeItem: () => { throw new Error('localStorage not available'); },
                    clear: () => { throw new Error('localStorage not available'); },
                    key: () => { throw new Error('localStorage not available'); },
                    length: 0
                },
                writable: true
            });
            
            render(<TestComponent key="test-key" options={{ fallback: 'memory' }} />);
            
            expect(screen.getByTestId('value').textContent).toBe('null');
        });
    });

    // ============================================================================
    // FALLBACK TESTS
    // ============================================================================

    describe('Fallback Mechanisms', () => {
        it('should fallback to memory storage when localStorage fails', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('localStorage failed');
            });
            
            render(<TestComponent key="test-key" options={{ fallback: 'memory' }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(screen.getByTestId('error').textContent).toBe('no-error');
                expect(screen.getByTestId('persisted').textContent).toBe('true');
            });
        });

        it('should fallback to sessionStorage when specified', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('localStorage failed');
            });
            sessionStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" options={{ fallback: 'session' }} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(sessionStorageMock.setItem).toHaveBeenCalled();
            });
        });
    });

    // ============================================================================
    // CROSS-TAB SYNCHRONIZATION TESTS
    // ============================================================================

    describe('Cross-tab Synchronization', () => {
        it('should sync data changes across tabs', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            render(<TestComponent key="test-key" />);
            
            // Simulate storage event from another tab
            const storageEvent = new StorageEvent('storage', {
                key: 'skill_forge_test-key',
                newValue: JSON.stringify({
                    data: { test: 'synced-data' },
                    version: 1,
                    timestamp: 1234567890,
                    checksum: 'abc123'
                }),
                oldValue: null,
                storageArea: localStorage
            });
            
            act(() => {
                window.dispatchEvent(storageEvent);
            });
            
            await waitFor(() => {
                expect(screen.getByTestId('value').textContent).toBe('{"test":"synced-data"}');
            });
        });
    });

    // ============================================================================
    // SIZE AND PERFORMANCE TESTS
    // ============================================================================

    describe('Size and Performance', () => {
        it('should track storage size', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                const size = parseInt(screen.getByTestId('size').textContent || '0');
                expect(size).toBeGreaterThan(0);
            });
        });

        it('should respect max size limit', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            render(<TestComponent key="test-key" options={{ maxSize: 100 }} />);
            
            // Try to set a large value
            const largeData = { 
                largeArray: new Array(10000).fill('very-large-data'),
                timestamp: Date.now()
            };
            
            act(() => {
                const setValueButton = screen.getByTestId('set-value');
                fireEvent.click(setValueButton);
            });
            
            await waitFor(() => {
                expect(screen.getByTestId('error').textContent).toContain('exceeds limit');
            });
        });
    });

    // ============================================================================
    // UTILITY FUNCTION TESTS
    // ============================================================================

    describe('Utility Functions', () => {
        it('should calculate total storage size', () => {
            localStorageMock.getItem.mockImplementation((key: string) => {
                if (key.startsWith('skill_forge_')) {
                    return 'test-data';
                }
                return null;
            });
            
            const totalSize = get_total_storage_size();
            expect(totalSize).toBeGreaterThan(0);
        });

        it('should get storage statistics', () => {
            localStorageMock.getItem.mockImplementation((key: string) => {
                if (key.startsWith('skill_forge_')) {
                    return 'test-data';
                }
                return null;
            });
            
            const stats = get_storage_stats();
            expect(stats.totalSize).toBeGreaterThan(0);
            expect(stats.itemCount).toBeGreaterThan(0);
            expect(stats.available).toBe(true);
        });

        it('should migrate storage data', () => {
            const oldData = {
                data: { oldFormat: 'data' },
                version: 1,
                timestamp: 1234567890,
                checksum: 'abc123'
            };
            
            localStorageMock.getItem.mockReturnValue(JSON.stringify(oldData));
            localStorageMock.setItem.mockImplementation(() => {});
            
            const migrationFn = (oldData: any) => ({ newFormat: oldData.oldFormat });
            const success = migrate_storage_data('test-key', migrationFn, 2);
            
            expect(success).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });
    });

    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================

    describe('Integration Tests', () => {
        it('should handle complete workflow with all features', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            localStorageMock.removeItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" options={{ 
                encrypt: true, 
                compress: true, 
                version: 2,
                maxSize: 1024 * 1024 
            }} />);
            
            // Set value
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(screen.getByTestId('persisted').textContent).toBe('true');
                expect(screen.getByTestId('error').textContent).toBe('no-error');
            });
            
            // Remove value
            fireEvent.click(screen.getByTestId('remove-value'));
            
            await waitFor(() => {
                expect(screen.getByTestId('value').textContent).toBe('null');
                expect(screen.getByTestId('persisted').textContent).toBe('false');
            });
            
            // Clear all
            fireEvent.click(screen.getByTestId('clear-all'));
            
            await waitFor(() => {
                expect(localStorageMock.removeItem).toHaveBeenCalled();
            });
        });

        it('should handle multiple instances with different keys', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            render(
                <div>
                    <TestComponent key="key1" initialValue={{ data: 'value1' }} />
                    <TestComponent key="key2" initialValue={{ data: 'value2' }} />
                </div>
            );
            
            const values = screen.getAllByTestId('value');
            expect(values[0].textContent).toBe('{"data":"value1"}');
            expect(values[1].textContent).toBe('{"data":"value2"}');
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe('Edge Cases', () => {
        it('should handle null and undefined values', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {});
            
            render(<TestComponent key="test-key" initialValue={null} />);
            
            fireEvent.click(screen.getByTestId('set-value'));
            
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
        });

        it('should handle circular references gracefully', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            const circularData: any = { test: 'data' };
            circularData.self = circularData;
            
            render(<TestComponent key="test-key" initialValue={circularData} />);
            
            // This should not crash
            expect(screen.getByTestId('value')).toBeInTheDocument();
        });

        it('should handle very large objects', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            const largeObject = {
                data: new Array(10000).fill('large-data'),
                metadata: { timestamp: Date.now() }
            };
            
            render(<TestComponent key="test-key" initialValue={largeObject} />);
            
            // Should handle without crashing
            expect(screen.getByTestId('value')).toBeInTheDocument();
        });
    });
});
