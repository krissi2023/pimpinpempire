// Pimpinpempire JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pimpinpempire is loading...');
    
    // Add some interactive effects
    const hero = document.querySelector('.hero');
    const container = document.querySelector('.container');
    
    // Add fade-in animation
    setTimeout(() => {
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 1000);
    
    // Add click effect to header
    const header = document.querySelector('header h1');
    if (header) {
        header.addEventListener('click', function() {
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    console.log('Welcome to your Empire!');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .hero {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-in-out;
    }
    
    .container {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-in-out;
    }
    
    header h1 {
        transition: transform 0.2s ease;
        cursor: pointer;
    }
`;
document.head.appendChild(style);