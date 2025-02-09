export function animateElement(element, startColor, endColor, speed) {
    let toggle = false;
    setInterval(() => {
        element.style.backgroundColor = toggle ? startColor : endColor;
        toggle = !toggle;
    }, speed);
} 