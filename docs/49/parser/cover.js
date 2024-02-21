class Cover {
    constructor() {
        this._uuid = van.state(crypto.randomUUID())
        this._created = van.state(new Date())
        this._title = van.state('§')
        this._catch = van.state('')
        this._intro = van.state('')
        this._category = van.state('')
        this._genre = van.state('')
        this._author = van.state(new Author())
    }
    get uuid() { return this._uuid.val }
    get created() { return this._created.val }
    get title() { return this._title.val }
    get catch() { return this._catch.val }
    get intro() { return this._intro.val }
    get category() { return this._category.val }
    get genre() { return this._genre.val }
    get author() { return this._author.val }
    set uuid(v) { this._uuid.val = v }
    set created(v) { this._created.val = v }
    set title(v) { this._title.val = v }
    set catch(v) { this._catch.val = v }
    set intro(v) { this._intro.val = v }
    set category(v) { this._category.val = v }
    set genre(v) { this._genre.val = v }
    set author(v) { this._author.val = v }
    get yaml() {
        return jsyaml.dump({
            title:this.title, 
            catch:this.catch, 
            intro:this.intro, 
            category:this.category, 
            genre:this.genre, 
        }) + this.author.yaml
    }
}
