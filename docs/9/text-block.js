(function(){
class TextBlock {
    static fromText(text) { return this.fromLines(this.#textToLines(text)) }
    static fromLines(lines) {
        const [blocks, block] = [[], []]
        for (let line of lines) {
            block.push(line)
            if (''===line && 0 < block.length) { blocks.push(block.join('\n')); block.splice(0); }
        }
        if (0 < block.length) { blocks.push(block.join('\n')) }
        return blocks.filter(v=>v)
    }
    static #textToLines(text) { return text.trim().split(/\r?\n/) }
    static selectedIndex(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[0] } 
    static selectedText(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[1] } 
    static selected(selectionEnd, text) {
        //   テキストブロック・インデックス取得
        const textBefore = text.slice(0, selectionEnd) // キャレット位置より前
        const textAfter = text.slice(selectionEnd) // キャレット位置より後
        const selectedBlockIndex = (textBefore.match(/[\n]{2,}/g) || []).length
        console.log('selectedBlockIndex:', selectedBlockIndex )
        //       キャレット位置のブロックテキスト取得
        //         開始位置、終了位置
        const blockStart = textBefore.lastIndexOf('\n\n')
        const blockEnd = textAfter.indexOf('\n\n')
        console.log(blockStart, blockEnd+textBefore.length)
        const block = text.slice(((-1<blockStart) ? blockStart+2 : 0), (-1<blockEnd) ? blockEnd+textBefore.length : text.length)
        return [selectedBlockIndex, block]
    }
}
window.TextBlock = TextBlock
})()
