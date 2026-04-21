export class Element {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    classNames(...classNames) {
        for (let className of classNames) {
            this.element.classList.add(className);
        }
        return this;
    }

    setAttributes(attrs) {
        for (let key in attrs) {
            this.element.setAttribute(key, attrs[key]);
        }
        return this;
    }

    textNode(text) {
        this.element.textContent = text;
        return this;
    }

    children(...children) {
        for (let child of children) {
            if (child instanceof HTMLElement) {
                this.element.appendChild(child);
            }
            if (child instanceof Element) {
                this.element.appendChild(child.toElement);
            }
        }
        return this;
    }

    addChild(child) {
        if (child instanceof HTMLElement) {
            this.element.appendChild(child);
        }
        if (child instanceof Element) {
            this.element.appendChild(child.toElement);
        }
        return this;
    }

    click(callBack) {
        this.element.addEventListener("click", callBack);
        return this;
    }

    get toElement() {
        return this.element;
    }
}

export function assert(expression, message) {
    if (!expression) {
        alert(message);
        return false;
    }
    return true;
}

class AlertBox {
    constructor() {
        this.element = new Element('div').classNames("alert-box");
    }

    show(message) {
        const messageElement = new Element("p").classNames("alert-message").textNode(message);
        this.element.addChild(messageElement);
        document.body.appendChild(this.element.toElement);
        setTimeout(() => {
            if (document.body.contains(this.element.toElement)) {
                document.body.removeChild(this.element.toElement);
            }
        }, 3000);
    }
}

class PromptBox {
    constructor() {
        this.element = new Element("div").classNames("prompt-box");
        this.inputField = new Element("input").setAttributes({
            type: "text",
            placeholder: "Entrez votre nom"
        });
        this.submitButton = new Element("button")
            .textNode("Confirmer")
            .classNames("prompt-btn", "btn", "btn-primary", "btn-large");
    }

    onSubmit(callBack) {
        const func = () => {
            const value = this.inputField.toElement.value.trim();
            if (!value) {
                alert("Entrez votre nom s'il vous plaît");
                return;
            }
            callBack(value);
            if (document.body.contains(this.element.toElement)) {
                document.body.removeChild(this.element.toElement);
            }
        };
        this.submitButton.click(func);
    }

    mount() {
        this.element.children(this.inputField, this.submitButton);
        return this.element.toElement;
    }
}

export function prompt(callBack) {
    const pb = new PromptBox();
    pb.onSubmit(callBack);
    const el = pb.mount();
    document.body.appendChild(el);
}

export function alert(message) {
    const ab = new AlertBox();
    ab.show(message);
}

export function shareViaWhatsApp(link, title = "KnowMe") {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${link}`)}`;
    window.open(whatsappUrl, "_blank");
}

export function copyToClipboard(text, successMessage = "Lien copié dans le presse-papier!") {
    navigator.clipboard.writeText(text).then(() => {
        alert(successMessage);
    }).catch(() => {
        alert("Impossible de copier le lien");
    });
}

export default function createElement(tag) {
    return new Element(tag);
}