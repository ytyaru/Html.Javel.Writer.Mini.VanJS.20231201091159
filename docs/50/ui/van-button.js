(function(){
const {div,span,a} = van.tags
class VanButton {
    static make(text, onPushed, onLongPushed) { return new VanButton(text, onPushed, onLongPushed) }
    States = {'isFree':0, 'isHide':1, 'isDisabled':2, 'isRiveted':3, 'isDown':4, 'isLongDowned':5 }
    constructor(text, onPushed, onLongPushed) {
        this._state = this.States.isFree
        this._device = {
            'keyboard':{name:'', isFocus:false, isDown:false, event:null, pushed:{start:0, end:0}},
            'gamepad':{name:'', isFocus:false, isDown:false, event:null},
            'mouse':{name:'', isHover:false, isDown:false, event:null},
            'touch':{name:'', isTouch:false, event:null},
        }
        this._text = van.state(text)
        this._themeColor = {
            base: chroma('#000'),
            main: chroma('#0d0'),
            accent: chroma('#dd0'),
        }
        this._style = vanX.reactive({
            'display': 'flex', // flex,grid,table,none,inline,inline-block,block
            'color': {fore:'#000', back:'#eee'},
            'border': {width:'2px', style:'solid', color:'#dd0', radius:'8px'},
            'outline': {width:'2px', style:'dashed', color:'#000', offset:'2px' },
        })
        this._pushed = {       // 押下時間（ms）
            start: Date.now(), // 押下した時点
            end  : Date.now(), // 離した時点
            long : 1000 * 2,   // 長押し判定する押下時間（この時間未満ならisRun, この時間以上ならisLongRunを実行する）
            once : {           // 連打防止（この時間未満に再実行要求されても無視する。一定時間isDisabledにすることで防ぐ）
                first: { start: 0, end: 0 },
                last:  { start: 0, end: 0 },
                time: 1000 * 2,
            }
        }
        this._timeout = { // setTimeout(), clearTimeout()
            'longPushed': null,
            'disabled': null,
        }
        this._element = this.#makeHtml(text, onPushed, onLongPushed)
        this.#updateState() 
        console.log(this._style.display)
        console.log(this._style.border)
        console.log(this._style.border.width)
        console.log(this.element)
        console.log(this.element)
    }
    get text() { return this._text }
    get element() { return this._element }
    get style() { return this._style }
    #makeHtml(text, onPushed, onLongPushed) {
        this.options = ((Type.isObject(text)) ? text : ({}))
        if (!this.options.hasOwnProperty('text')) { this.options.text = ((text) ? text : 'button') }
        if (!this.options.hasOwnProperty('onPushed')) { this.options.onPushed = ((Type.isFunction(onPushed)) ? onPushed : ()=>alert('Pushed button !!')) }
        if (!this.options.hasOwnProperty('onLongPushed')) { this.options.onLongPushed = ((Type.isFunction(onLongPushed)) ? onLongPushed : ()=>alert('Long pushed button !!')) }
        console.log('options:',this.options)
        this._text = van.state(this.options.text)
        return div({class:'van-button'}, this.#makeAttr(), ()=>this._text.val) // div要素はonfocusが機能しない?!
    }
    #makeAttr() {
        const attr = {}
        attr.onkeydown = (e)=>this.#onKeydown(e)
        attr.onkeyup = (e)=>this.#onKeyup(e)
        attr.onfocus = (e)=>{console.log('focus');this._device.keyboard.isFocus=true;this.#updateState();}
        attr.onblur = (e)=>{console.log('blur');this._device.keyboard.isFocus=false;this.#updateState();}
        attr.onmouseenter = (e)=>{console.log('mouseenter');this._device.mouse.isHover=true;this.#updateState();}
        attr.onmouseleave = (e)=>{console.log('mouseleave');this._device.mouse.isHover=false;this.#updateState();}
        attr.onpointerenter = (e)=>{console.log('pointerenter');this._device.touch.isHover=true;this.#updateState();}
        attr.onpointerleave = (e)=>{console.log('pointerleave');this._device.touch.isHover=false;this.#updateState();}
        attr.onpointerin = (e)=>{console.log('pointerin');this._device.touch.isHover=true;this.#updateState();}
        attr.onpointerout = (e)=>{console.log('pointerout');this._device.touch.isHover=false;this.#updateState();}
        attr.onpointerdown = (e)=>{console.log('pointerdown');this.#pushStart();this._device.touch.isTouch=true;this.#updateState();}
        attr.onpointerup = (e)=>{console.log('pointerup');this._device.touch.isTouch=false;this.#updateState();this.#onPushed(e);}
        attr.onpointercancel = (e)=>{console.log('pointercancel');this._device.touch.isTouch=false;this.#updateState();}
        attr.style = ()=>this.#style()
        attr.tabindex = 0 // フォーカス可能にする
        return attr
    }
    #pushStart() {
        this._pushed.start = Date.now()
        this.#setOnceTime('start')
        this.#clearTimeoutLongPushed()
        this._timeout.longPushed = setTimeout(()=>this.options.onLongPushed(), this._pushed.long)
    }
    #clearTimeoutLongPushed() { if (this._timeout.longPushed) { clearTimeout(this._timeout.longPushed) } }
    #onPushed(e) {
        this._pushed.end = Date.now()
        this.#setOnceTime('end')
        if (this.States.isDisabled===this._state) {
            if (this.options.isOnce) { // disabled時間内に押下するとdisabled解放時間が延長する
                if (this._timeout.disabled) { clearTimeout(this._timeout.disabled); }
                this._timeout.disabled = setTimeout(()=>{ this._state = this.States.isFree; this.#clearOnceTime(); this.#updateState(); }, this._pushed.once.time)
            }
            return
        }
        if (this.#isLognPushed()) { return }
        this.#clearTimeoutLongPushed(e)
        if (this.options.isOnce) {
            if (this.#isDuplicatePushed()) { console.log('%c DuplicatePushed!!!!!!!!!!!!!!!!!!', 'background-color: red; color: white;'); return } // 超短時間に２回以上実行要求されたら
            console.log('%c oncePushed !!!!!!!!!!!!!!!!!!', 'background-color: green; color: white;')
            this.options.onPushed(e)// まだ一回しか要求されてない、２回以上要求されたが一定時間以上の間隔がある
            this._state = this.States.isDisabled
            this.#updateState()
            if (this._timeout.disabled) { clearTimeout(this._timeout.disabled); }
            this._timeout.disabled = setTimeout(()=>{ this._state = this.States.isFree; this.#clearOnceTime(); this.#updateState(); }, this._pushed.once.time)
        } else { this.options.onPushed(e) }
        this._pushed.start = Date.now()
        console.log(e)
    }
    #isDuplicatePushed() {
        console.log('this._pushed.once', this._pushed.once, [this._pushed.once.first.start, this._pushed.once.first.end, this._pushed.once.last.start, this._pushed.once.last.end].some(v=>v===0), ((this._pushed.once.last.start - this._pushed.once.first.end) < this._pushed.once.time))
        if ([this._pushed.once.first.start, this._pushed.once.first.end, this._pushed.once.last.start, this._pushed.once.last.end].some(v=>v===0)) { return false }
        return ((this._pushed.once.last.start - this._pushed.once.first.end) < this._pushed.once.time)
    }
    #setOnceTime(se) { // se: 'start'/'end'
        if (0===this._pushed.once.first[se]) { this._pushed.once.first[se] = Date.now(); }
        else { this._pushed.once.last[se] = Date.now() }
        console.log('#setOnceTime(se)', se, this._pushed.once, (this._pushed.once.first[se]), (this._pushed.once.last[se]))
        console.log(this._pushed.once.first.start, this._pushed.once.first.end)
        console.log(this._pushed.once.last.start, this._pushed.once.last.end)
    }
    #clearOnceTime() {
        this._pushed.once.first.start = 0
        this._pushed.once.first.end = 0
        this._pushed.once.last.start = 0
        this._pushed.once.last.end = 0
    }
    #isLognPushed() { return (this._pushed.long <= this.#pushedMs()) }
    #pushedMs() { return this._pushed.end - this._pushed.start }
    #onKeydown(e) {
        console.log('#onKeydown(e):', e.key, ' '===e.key)
        if      ([' ', 'Enter'].some(k=>k===e.key)) { this.#pushedKeyboard(e); }
//        else if ('Enter'===e.key) { this._device.keyboard.isDown = true; this.#updateState(); }
//        else if ('Esc'===e.key) {  }
//        else if ('F1'===e.key) {  }
    }
    #pushedKeyboard(e) {
        this._device.keyboard.isDown = true
        if (0===this._device.keyboard.pushed.start) {
            this._device.keyboard.pushed.start = Date.now()
            this.#pushStart()
            this.#updateState();
        }
    }
    #releasedKeyboard(e) {
        this._device.keyboard.isDown = false
//        if (0===this._device.keyboard.pushed.end) { this._device.keyboard.pushed.end = Date.now() }
        this.#updateState()
        this.#onPushed(e);
        this._device.keyboard.pushed.start = 0
    }
    #onKeyup(e) {
        console.log('#onKeyup(e):', e.key)
        if ([' ', 'Enter'].some(k=>k===e.key)) { this.#releasedKeyboard(e); }
    }
    #hasFocus(e) { return (e.target===document.activeElement) }
    #style() { return `user-select:none;cursor:pointer;box-sizing:border-box;${this.#outline()}${this.#border()}${this.#display()}justify-content:center;align-items:center;padding:0;margin:0;color:${this._style.color.fore};background-color:${this._style.color.back};` }
    #display() { return `display:${this._style.display};`; }
    #border() { return `border-width:${this._style.border.width};border-style:${this._style.border.style};border-color:${this._style.border.color};${this.#borderRadius()}` }
    #borderRadius() { return `border-radius:${this._style.border.radius};` }
    #outline() { return `outline-width:${this._style.outline.width};outline-style:${this._style.outline.style};outline-color:${this._style.outline.color};outline-offset:${this._style.outline.offset};` }
    #updateState() {
        if (this.States.isHide===this._state) { }
        else if (this.States.isDisabled===this._state) { }
        else if (this.#isRiveted()) { this._state = ((this.#isDown()) ? this.States.isDown : this.States.isRiveted); }
        else if (this.#isDown()) { this._state = this.States.isDown }
        else { this._state = this.States.isFree; }
        console.log('this._state:', this._state)
        console.log('key:', this._device.keyboard.isFocus, 'pad:', this._device.gamepad.isFocus, 'hov:', this._device.mouse.isHover)
        console.log('key:', this._device.keyboard.isDown, 'pad:', this._device.gamepad.isDown, 'mou:', this._device.mouse.isDown, 'tou:', this._device.touch.isTouch)
        this.#updateStyle()
    }

    #isDown() { return (this._device.keyboard.isDown || this._device.gamepad.isDown || this._device.mouse.isDown || this._device.touch.isTouch) }
    #isRiveted() { return (this._device.keyboard.isFocus || this._device.gamepad.isFocus || this._device.mouse.isHover) }
    #updateStyle() {
        switch (this._state) {
            case this.States.isFree: return this.#setStyleFree()
            case this.States.isHide: return this.#setStyleHide()
            case this.States.isDisabled: return this.#setStyleDisabled()
            case this.States.isRiveted: return this.#setStyleRiveted()
            case this.States.isDown: return this.#setStyleDown()
            case this.States.isLongDown: return this.#setStyleLongDown()
            default: throw new Error('不正な状態です。')
        }
    }
    #setStyleFree() {
        console.log('#setStyleFree()', this._style.color.fore, this._style.color.fore.val)
        this._style.color.fore = this._themeColor.main.hex() // Css.get('--cs-main')
        this._style.color.back = this._themeColor.base.hex() // Css.get('--cs-base')
        this._style.border.color = this._themeColor.accent.hex()
        this._style.outline.width = '0px'
        console.log('fore:', this._style.color.fore)
        console.log('back:', this._style.color.back)
    }
    #setStyleHide() { this._style.display = 'none' }
    #setStyleDisabled() {
        this._style.color.fore = chroma.mix(this._themeColor.main, this._themeColor.base).hex()
        this._style.color.back = this._themeColor.base.hex()
        this._style.border.color = this._style.color.fore
        this._style.outline.width = '0px'
    }
    #setStyleRiveted() {
        console.log('#setStyleRiveted()', this._style.color.fore, this._style.color.fore.val)
        this._style.color.fore = this._themeColor.base.hex()
        this._style.color.back = this._themeColor.main.hex()
        this._style.border.color = this._style.color.fore
        this._style.outline.width = '2px'
        this._style.outline.color = this._themeColor.accent.hex()
        console.log('fore:', this._style.color.fore)
        console.log('back:', this._style.color.back)
    }
    #setStyleDown() {
        this._style.color.fore = this._themeColor.accent.hex()
        this._style.color.back = this._themeColor.base.hex()
        this._style.border.color = this._style.color.fore
        this._style.outline.width = '2px'
    }
    #setStyleLongDown() {
        this._style.color.fore = this._themeColor.accent.hex()
        this._style.color.back = this._themeColor.base.hex()
        this._style.border.color = this._style.color.fore
        this._style.outline.width = '2px'
    }
}
window.VanButton = VanButton
})()
