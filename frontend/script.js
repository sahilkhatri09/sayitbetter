// Tone Formatter Frontend JavaScript
class ToneFormatter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
        this.loadUsage(); // Load initial usage count
    }

    initializeElements() {
        // Main elements
        this.textInput = document.getElementById('textInput');
        this.formalBtn = document.getElementById('formalBtn');
        this.casualBtn = document.getElementById('casualBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.charCount = document.getElementById('charCount');
        
        // Loading and error elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Usage elements
        this.usageCountElement = document.getElementById('usageCount');
        
        // State
        this.isLoading = false;
        this.lastRequest = null; // Store last request for retry functionality
    }

    bindEvents() {
        // Text input events
        this.textInput.addEventListener('input', () => this.handleTextInput());
        this.textInput.addEventListener('paste', () => {
            // Slight delay to allow paste to complete
            setTimeout(() => this.handleTextInput(), 10);
        });

        // Button events
        this.formalBtn.addEventListener('click', () => this.formatText('formal'));
        this.casualBtn.addEventListener('click', () => this.formatText('casual'));
        this.clearBtn.addEventListener('click', () => this.clearText());

        // Modal events
        this.closeErrorModal.addEventListener('click', () => this.hideError());
        this.retryBtn.addEventListener('click', () => this.retryLastRequest());
        
        // Close modal on backdrop click
        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideError();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.isLoading) {
                e.preventDefault();
                e.returnValue = 'Text formatting in progress. Are you sure you want to leave?';
            }
        });
    }

    handleTextInput() {
        this.updateCharCount();
        this.updateUI();
        
        // Auto-save to localStorage for crash recovery
        this.saveToLocalStorage();
    }

    updateCharCount() {
        const length = this.textInput.value.length;
        this.charCount.textContent = length.toLocaleString();
        
        // Visual feedback for character limit
        const maxLength = 10000;
        const percentage = (length / maxLength) * 100;
        
        if (percentage > 90) {
            this.charCount.style.color = 'var(--color-error)';
        } else if (percentage > 70) {
            this.charCount.style.color = 'var(--color-text-secondary)';
        } else {
            this.charCount.style.color = 'var(--color-text-muted)';
        }
    }

    updateUI() {
        const hasText = this.textInput.value.trim().length > 0;
        const isValidLength = this.textInput.value.length <= 10000;
        
        // Update button states
        this.formalBtn.disabled = this.isLoading || !hasText || !isValidLength;
        this.casualBtn.disabled = this.isLoading || !hasText || !isValidLength;
        this.clearBtn.style.opacity = hasText ? '1' : '0.3';
        
        // Update textarea border if over limit
        if (!isValidLength) {
            this.textInput.style.borderColor = 'var(--color-error)';
        } else {
            this.textInput.style.borderColor = 'var(--color-border)';
        }
    }

    async formatText(tone) {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showError('Please enter some text to format.');
            return;
        }

        if (text.length > 10000) {
            this.showError('Text is too long. Please keep it under 10,000 characters.');
            return;
        }

        // Store request for retry functionality
        this.lastRequest = { text, tone };

        try {
            this.setLoading(true);

            const response = await fetch('/api/format', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, tone })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.formattedText) {
                throw new Error('Invalid response from server');
            }

            // Update textarea with formatted text
            this.textInput.value = data.formattedText;
            this.handleTextInput(); // Update UI after text change
            
            // Add success visual feedback
            this.showSuccess(tone);
            
            // Update usage count after successful call
            this.loadUsage();

        } catch (error) {
            console.error('Format error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }

    getErrorMessage(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        } else if (message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        } else if (message.includes('api configuration')) {
            return 'Service temporarily unavailable. Please try again later.';
        } else if (message.includes('external api')) {
            return 'AI service temporarily unavailable. Please try again later.';
        } else if (message.includes('too long')) {
            return 'Text is too long. Please keep it under 10,000 characters.';
        } else if (message.includes('rate limit')) {
            return 'Too many requests. Please wait a moment and try again.';
        } else {
            return error.message || 'Something went wrong. Please try again.';
        }
    }

    showSuccess(tone) {
        // Create temporary success indicator
        const successMsg = document.createElement('div');
        successMsg.textContent = `✓ Text formatted to be more ${tone}`;
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 12px 16px;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-md);
            z-index: 1200;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => successMsg.remove(), 300);
        }, 3000);
    }

    clearText() {
        if (this.textInput.value.trim() && 
            !confirm('Are you sure you want to clear all text?')) {
            return;
        }
        
        this.textInput.value = '';
        this.handleTextInput();
        this.textInput.focus();
        localStorage.removeItem('toneFormatter_text');
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loadingOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            this.loadingOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        this.updateUI();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideError() {
        this.errorModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    retryLastRequest() {
        this.hideError();
        if (this.lastRequest) {
            this.formatText(this.lastRequest.tone);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter for quick formatting (defaults to formal)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !this.isLoading) {
            e.preventDefault();
            if (!this.formalBtn.disabled) {
                this.formatText('formal');
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (!this.errorModal.classList.contains('hidden')) {
                this.hideError();
            }
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('toneFormatter_text', this.textInput.value);
        } catch (error) {
            // Ignore localStorage errors (quota exceeded, etc.)
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedText = localStorage.getItem('toneFormatter_text');
            if (savedText && savedText.trim()) {
                this.textInput.value = savedText;
                this.handleTextInput();
                
                // Ask user if they want to restore
                if (savedText.length > 50) { // Only ask for substantial text
                    setTimeout(() => {
                        if (confirm('Restore your previous text?')) {
                            // Text is already restored, just focus
                            this.textInput.focus();
                        } else {
                            this.clearText();
                        }
                    }, 500);
                }
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }

    // Public API for external use
    setText(text) {
        this.textInput.value = text;
        this.handleTextInput();
    }

    getText() {
        return this.textInput.value;
    }

    focus() {
        this.textInput.focus();
    }

    // Simple usage display
    async loadUsage() {
        try {
            const response = await fetch('/api/usage');
            if (response.ok) {
                const data = await response.json();
                this.updateUsageDisplay(data.totalUsage);
            } else {
                this.usageCountElement.textContent = '?';
            }
        } catch (error) {
            this.usageCountElement.textContent = '?';
        }
    }

    updateUsageDisplay(count) {
        this.usageCountElement.textContent = this.formatLargeNumber(count);
        
        // Subtle pulse animation for updates
        this.usageCountElement.style.transform = 'scale(1.15)';
        this.usageCountElement.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            this.usageCountElement.style.transform = 'scale(1)';
        }, 300);
    }

    formatLargeNumber(num) {
        // Handle millions first
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        // Handle thousands, but anything 999,500 or higher rounds to 1M
        if (num >= 999500) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toneFormatter = new ToneFormatter();
    
    // Try to restore previous session
    window.toneFormatter.loadFromLocalStorage();
    
    // Focus on textarea after a brief delay
    setTimeout(() => {
        window.toneFormatter.focus();
    }, 300);
});

// Make sure app works even if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    window.toneFormatter = new ToneFormatter();
    window.toneFormatter.loadFromLocalStorage();
    setTimeout(() => {
        window.toneFormatter.focus();
    }, 300);
}
