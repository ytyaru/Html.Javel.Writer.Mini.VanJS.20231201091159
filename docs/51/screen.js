(function(){
class Screen {
    constructor() {
        this._width = 0
        this._height = 0
        this._inline = 0
        this._block = 0
    }
    resize() {
        this._width = document.documentElement.clientWidth
        this._height = document.documentElement.clientHeight
        this._inline = (this.isVertical) ? H : W
        this._block = (this.isVertical) ? W : H
    }
    get width() { return this._width }
    get height() { return this._height }
    get inline() { return this._inline }
    get block() { return this._block  }
    get writingMode() { return Css.get('writing-mode', document.body).trim().toLowerCase() }
    get isVertical() { return 'vertical-rl'===this.writingMode }
    get isHorizontal() { return 'horizontal-tb'===this.writingMode }
}
window.Screen = new Screen()
})()
