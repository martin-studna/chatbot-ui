export function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

export function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

export function removePopup() {
    Array.prototype.forEach.call(document.querySelectorAll('[role="tooltip"]'), function (element) {
        console.log( element )
        element.style.visibility = 'hidden';
    })
}

export function addPopup() {
    Array.prototype.forEach.call(document.querySelectorAll('[role="tooltip"]'), function (element) {
        console.log( element )
        element.style.visibility = 'visible';
    })
}