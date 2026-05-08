/**
 * script.js - Frontend Logic for Gemini Chatbot
 * Handles UI updates, conversation state, and API communication with Markdown support.
 */

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const submitBtn = chatForm.querySelector('button[type="submit"]');

    // State to maintain the history of the conversation
    let conversationHistory = [];

    /**
     * Appends a message to the chat box DOM
     * @param {string} role - 'user' or 'model'
     * @param {string} text - Message content (Markdown supported for model)
     * @returns {HTMLElement} The created message element
     */
    function appendMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        
        if (role === 'model') {
            // Use marked.parse to convert Markdown (from AI) to HTML
            // We ensure it's a string and handle potential parsing
            messageDiv.innerHTML = marked.parse(text);
        } else {
            // Use textContent for user input to prevent XSS
            messageDiv.textContent = text;
        }
        
        chatBox.appendChild(messageDiv);
        
        // Scroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
        
        return messageDiv;
    }

    /**
     * Handle form submission
     */
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const message = userInput.value.trim();
        if (!message) return;

        // 1. Prepare UI
        userInput.value = '';
        userInput.disabled = true;
        submitBtn.disabled = true;

        // 2. Add user message
        appendMessage('user', message);
        conversationHistory.push({ role: 'user', text: message });

        // 3. Show "Thinking..." placeholder
        const botMessageElement = appendMessage('model', 'Thinking...');

        try {
            // 4. Request AI response
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation: conversationHistory }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            if (data && data.result) {
                // 5. Convert Markdown result to HTML and update the UI
                botMessageElement.innerHTML = marked.parse(data.result);
                
                // Save original text to history
                conversationHistory.push({ role: 'model', text: data.result });
            } else {
                botMessageElement.textContent = 'Sorry, no response received.';
            }

        } catch (error) {
            console.error('Chat Error:', error);
            botMessageElement.textContent = 'Failed to get response from server.';
            botMessageElement.classList.add('error-text');
        } finally {
            userInput.disabled = false;
            submitBtn.disabled = false;
            userInput.focus();
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
});
