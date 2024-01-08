(function(){
class Font {
    constructor() {
        this._size = 16
        this._family = null
    }
    resize() { this._size = this.#size }
    get size() { return this._size }
    get #size() {
        const [W, H, I, B] = this.#sizes
//        const [W, H, I, B] = Screen.sizes
        const minLineChars = I / 16
        if (minLineChars <= 30) { return 16 } // Screen<=480px: 16px/1字 1〜30字/行
        else if (minLineChars <= 40) { return 18 } // Screen<=640px: 18px/1字 26.6〜35.5字/行
        else { return I / 40 } // Screen<=640px: ?px/1字 40字/行
    }
    get #sizes() {
        const W = document.documentElement.clientWidth
        const H = document.documentElement.clientHeight
        const I = (this.isVertical) ? H : W
        const B = (this.isVertical) ? W : H
        return [W, H, I, B]
    }
}
window.Font = new Font()
})()
