class FactGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openRouterApiKey');
        this.initializeElements();
        this.setupEventListeners();
        this.checkApiKey();
    }

    initializeElements() {
        this.apiKeySection = document.getElementById('apiKeySection');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyButton = document.getElementById('saveApiKey');
        this.generateButton = document.getElementById('generateFact');
        this.factDisplay = document.getElementById('factDisplay');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.themeToggle = document.getElementById('themeToggle');
        this.copyButton = document.getElementById('copyButton');
        this.copyNotification = document.getElementById('copyNotification');
        this.categoryInput = document.getElementById('categoryInput');
        this.suggestedCategories = document.getElementById('suggestedCategories');
        this.updateApiKeyButton = document.getElementById('updateApiKey');
        this.resetApiKeyButton = document.getElementById('resetApiKey');
        this.apiKeyActions = document.querySelector('.api-key-actions');
        this.shareButtons = document.getElementById('shareButtons');
        this.shareToFB = document.getElementById('shareToFB');
        this.shareToTwitter = document.getElementById('shareToTwitter');
        this.embedCode = document.getElementById('embedCode');
        this.copyEmbed = document.getElementById('copyEmbed');
    }

    setupEventListeners() {
        this.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
        this.generateButton.addEventListener('click', () => this.generateFact());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.copyButton.addEventListener('click', () => this.copyFact());
        this.categoryInput.addEventListener('focus', () => this.showCategories());
        this.categoryInput.addEventListener('blur', () => setTimeout(() => this.hideCategories(), 200));
        this.updateApiKeyButton.addEventListener('click', () => this.showUpdateApiKey());
        this.resetApiKeyButton.addEventListener('click', () => this.resetApiKey());
        this.shareToFB.addEventListener('click', () => this.shareToSocial('facebook'));
        this.shareToTwitter.addEventListener('click', () => this.shareToSocial('twitter'));
        this.copyEmbed.addEventListener('click', () => this.copyEmbedCode());
        
        // Add click handlers for category tags
        const categoryTags = document.querySelectorAll('.category-tag');
        categoryTags.forEach(tag => {
            tag.addEventListener('click', () => this.selectCategory(tag.dataset.category));
        });
    }

    checkApiKey() {
        if (!this.apiKey) {
            this.apiKeySection.classList.remove('hidden');
            this.apiKeyActions.classList.add('hidden');
        } else {
            this.apiKeySection.classList.add('hidden');
            this.apiKeyActions.classList.remove('hidden');
        }
    }

    showUpdateApiKey() {
        this.apiKeyInput.value = ''; // Clear existing value
        this.apiKeySection.classList.remove('hidden');
        this.apiKeyInput.focus();
    }

    resetApiKey() {
        if (confirm('Adakah anda pasti mahu reset API key? Anda perlu masukkan key baharu untuk menjana fakta.')) {
            localStorage.removeItem('openRouterApiKey');
            this.apiKey = null;
            this.apiKeyInput.value = '';
            this.checkApiKey();
            this.factDisplay.textContent = 'Sila masukkan API key baharu untuk menjana fakta.';
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('openRouterApiKey', key);
            this.apiKey = key;
            this.apiKeySection.classList.add('hidden');
            this.apiKeyActions.classList.remove('hidden');
            // Show success message
            this.factDisplay.textContent = 'API key berjaya disimpan! Klik butang Generate Fact untuk menjana fakta.';
        } else {
            alert('Sila masukkan API key yang sah');
        }
    }

    toggleTheme() {
        const body = document.body;
        const icon = this.themeToggle.querySelector('i');
        
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('hidden');
            this.generateButton.disabled = true;
        } else {
            this.loadingSpinner.classList.add('hidden');
            this.generateButton.disabled = false;
        }
    }

    formatFact(fact) {
        // Add category emoji based on content
        const categories = {
            'sains': '🔬',
            'teknologi': '💻',
            'sejarah': '📜',
            'alam': '🌿',
            'nature': '🌿',
            'dunia': '🌍',
            'haiwan': '🐾',
            'manusia': '👥',
            'planet': '🪐',
            'galaxy': '🌌'
        };

        // Detect category from fact content
        let categoryEmoji = '💡'; // default emoji
        for (const [key, emoji] of Object.entries(categories)) {
            if (fact.toLowerCase().includes(key)) {
                categoryEmoji = emoji;
                break;
            }
        }

        // Format the fact with spacing and structure
        const formattedFact = `${categoryEmoji} FAKTA MENARIK ${categoryEmoji}\n\n${fact}\n\n#FaktaMenarik #InfoMalaysia`;

        return formattedFact;
    }

    async copyFact() {
        try {
            await navigator.clipboard.writeText(this.factDisplay.textContent);
            this.copyNotification.classList.remove('hidden');
            setTimeout(() => {
                this.copyNotification.classList.add('hidden');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('Failed to copy text to clipboard');
        }
    }

    async generateFact() {
        if (!this.apiKey) {
            alert('Please enter your OpenRouter API key first');
            this.apiKeySection.classList.remove('hidden');
            return;
        }

        this.showLoading(true);
        this.copyButton.classList.add('hidden');

        const timestamp = new Date().getTime();
        const randomSeed = Math.floor(Math.random() * 1000000);
        const category = this.categoryInput.value.trim();
        const categoryPrompt = category 
            ? `tentang ${category}` 
            : 'tentang sains, sejarah, alam semulajadi, atau teknologi';

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Random Facts Generator',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'google/learnlm-1.5-pro-experimental:free',
                    messages: [{
                        role: 'system',
                        content: 'Anda adalah penjana fakta yang menarik dalam Bahasa Malaysia. Gunakan bahasa yang santai dan mesra, seolah-olah anda bercerita kepada kawan. Fakta perlu ditulis dengan gaya penceritaan yang menarik dan mudah difahami. Elakkan penggunaan bahasa formal.'
                    }, {
                        role: 'user',
                        content: `Request #${timestamp}-${randomSeed}: Kongsikan satu fakta menarik ${categoryPrompt} dalam Bahasa Malaysia. Fakta ini mestilah unik dan berbeza daripada sebelumnya. Ceritakan dengan gaya yang santai dan menarik, seperti bercerita kepada kawan. Mulakan dengan frasa yang menarik perhatian seperti "Tahukah anda" atau "Menariknya". Huraikan fakta dengan lebih mendalam untuk memberikan gambaran yang lebih jelas kepada pembaca.`
                    }],
                    temperature: 0.9,
                    max_tokens: 500,
                    top_p: 0.9,
                    stream: false,
                    timeout: 60
                }),
                timeout: 60000
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('API Error Response:', errorData);
                throw new Error(errorData?.error?.message || `API request failed (${response.status}). Please try again.`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.choices?.[0]?.message?.content) {
                const rawFact = data.choices[0].message.content;
                const endsWithPunctuation = /[.!?](\s|)$/.test(rawFact);
                if (!endsWithPunctuation) {
                    console.warn('Fact might be truncated:', rawFact);
                }
                const formattedFact = this.formatFact(rawFact);
                this.factDisplay.textContent = formattedFact;
                setTimeout(() => {
                    this.copyButton.classList.remove('hidden');
                    this.shareButtons.classList.remove('hidden');
                }, 300);
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Full error:', error);
            this.factDisplay.textContent = error.message.includes('timeout') 
                ? 'Maaf, mengambil masa terlalu lama untuk menjana fakta. Sila cuba lagi.' 
                : `Maaf, terdapat ralat semasa menjana fakta: ${error.message}. Sila cuba lagi.`;
            this.copyButton.classList.add('hidden');
        } finally {
            this.showLoading(false);
        }
    }

    showCategories() {
        this.suggestedCategories.classList.remove('hidden');
    }

    hideCategories() {
        this.suggestedCategories.classList.add('hidden');
    }

    selectCategory(category) {
        this.categoryInput.value = category;
        this.hideCategories();
    }

    shareToSocial(platform) {
        const text = this.factDisplay.textContent;
        let url;
        
        if (platform === 'facebook') {
            // Simpler Facebook share
            url = 'https://www.facebook.com/sharer.php?' +
                'u=' + encodeURIComponent(window.location.href) +
                '&t=' + encodeURIComponent(text);
        } else if (platform === 'twitter') {
            // Twitter share
            url = 'https://twitter.com/intent/tweet?' +
                'text=' + encodeURIComponent(text) +
                '&url=' + encodeURIComponent(window.location.href) +
                '&hashtags=FaktaMenarik,InfoMalaysia';
        }
        
        if (url) {
            const width = 600;
            const height = 400;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(
                url,
                '',
                `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
            );
        }
    }

    async copyEmbedCode() {
        try {
            await navigator.clipboard.writeText(this.embedCode.value);
            const originalText = this.copyEmbed.innerHTML;
            this.copyEmbed.innerHTML = '<i class="fas fa-check"></i> Disalin!';
            setTimeout(() => {
                this.copyEmbed.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy embed code:', err);
            alert('Gagal menyalin kod. Sila cuba lagi.');
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FactGenerator();
}); 