(function(){
const {table,tr,th,td,a,input,button,br} = van.tags
class WebService {
    constructor() {
        this._items = new Map()
        this._items.set('github', {category:'hosting', name:'GitHub', domain:'github.com', user:{id:null, name:''}})
        this._items.set('mastodon', {category:'sns', name:'Mastodon', instances:new Map([['mstdn.jp', ({user:{id:null, name:''}})],['mastodon-japan.net', ({user:{id:null, name:''}})]]), ui:new InstanceUi('mastodon')})
        this._items.set('misskey', {category:'sns', name:'Misskey', instances:new Map([['nijimiss.moe', ({user:{id:null, name:''}})], ['misskey-square.net', ({user:{id:null, name:''}})]]), ui:new InstanceUi('misskey')})
//        this._items.set('mastodon', {category:'sns', name:'Mastodon', instances:new Map([['mstdn.jp', ({user:{id:null, name:''}})],['mastodon-japan.net', ({user:{id:null, name:''}})]])})
//        this._items.set('misskey', {category:'sns', name:'Misskey', instances:new Map([['nijimiss.moe', ({user:{id:null, name:''}})], ['misskey-square.net', ({user:{id:null, name:''}})]])})
        console.log(this._items.entries())
//        console.log(Array.from(this._items.entries()).map(([k,v])=>console.log(k, v)))
//        console.log(Array.from(this._items.entries()).filter(([k,v])=>k).map(([k,v])=>console.log(k, v)))
        console.log(Array.from(this._items.entries()).filter(([k,v])=>{console.log('filter:',k,v);return k;}).map(([k,v])=>console.log(k, v)))
        console.log(this.array.map(([k,v])=>console.log(k, v)))
        console.log(this.array.length)
    }
    get items() { return this._items }
    //get silos() { return services.values.filter((v)=>!v.hasOwnProperty('instances')) } // 営利系サービス
    //get federateds() { return services.values.filter((v)=>v.hasOwnProperty('instances')) } // 連合系サービス
    //get silos() { return new Map(this._items.entries().map((k,v)=>(!v.hasOwnProperty('instances')) ? ([k,v]) : null).filter(v=>v)) } // 営利系サービス
    get array() { return Array.from(this._items.entries()).filter(([k,v])=>k) }
    get siloArray() { return Array.from(this._items.entries()).filter(([k,v])=>!v.hasOwnProperty('instances')) }
    get federatedArray() { return Array.from(this._items.entries()).filter(([k,v])=>v.hasOwnProperty('instances')) }
    get silos() { return new Map(this.siloArray) } // 営利系サービス
    //federateds(s) { return new Map(this._items.entries().map((k,v)=>((!s || s===k) ? [k, v] : null).filter(v=>v))) } // 連合系サービス
    //federateds(s) { return new Map(this.array.map(([k,v])=>((!s || s===k) ? [k, v] : null).filter(v=>v))) } // 連合系サービス
    federateds(s) { return new Map(this.federatedArray.map(([k,v])=>((!s || (s && s===k)) ? [k, v] : null)).filter(v=>v)) } // 連合系サービス
    addInstance(s, domain, username) { this._items.get(s).instances.set(domain, {user:{id:null, name:username}}) }
    removeInstance(s, domain) { this._items.get(s).instances.delete(domain) }
}
class InstanceUi {
    constructor(serviceKey) {
        this._serviceKey = serviceKey
        this._items = vanX.reactive([])
        //this._items = vanX.reactive([{domain:'test.com',user:{id:null,name:'test-user'}}])
    }
    get items() { return this._items }
    makeDomain() { return [
        input({id:`new-instance-${this._serviceKey}`,placeholder:`domain.com`,size:8}), 
        this.#makeAddButton(),
    ] }
    #makeAddButton() { return button({
        onclick:e=>{
            console.log('button clicked!!', document.querySelector(`#new-instance-${this._serviceKey}`).value)
            this.#addDomain(document.querySelector(`#new-instance-${this._serviceKey}`).value)
            console.log(this.items)
        }, 
        onkeydown:e=>{
            if (' '===e.key) { e.preventDefault() }
            if ([' ','Enter','Ins'].some(v=>v===e.key)) {
                this.#addDomain(document.querySelector(`#new-instance-${this._serviceKey}`).value)
            }
        },
    }, '＋') }
    makeTrs() {
        console.log('makeTrs()..........', this._serviceKey)
        const trs = []
        //console.log(this._s.federateds(serviceKey))
        //const inss = this._s.federateds(serviceKey).instances
        //const inss = this._s.items.get(serviceKey).instances
        const inss = this.items
        console.log(inss)
        //for (let domain of this.federateds.get(serviceKey).instances.keys()) {
        //for (let domain of inss.keys()) {
        for (let domain of inss.map(ins=>ins.domain)) {
            trs.push(tr(
                //((0===trs.length) ? th({rowspan:this.federateds.get(serviceKey).instances.size()}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                //((0===trs.length) ? th({rowspan:inss.size}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                //((0===trs.length) ? th({rowspan:inss.size}, a(Ui.extLink({href:`https://ja.wikipedia.org/wiki/${serviceKey}`,style:`display:block;`}), serviceKey)) : null),
                //((0===trs.length) ? th({rowspan:inss.length}, a(Ui.extLink({href:`https://ja.wikipedia.org/wiki/${serviceKey}`,style:`display:block;`}), serviceKey)) : null),
                //th(a(Ui.extLink({href:`https://${domain}/`,style:`display:block;`}), domain), a({onclick:e=>{this.#delDomain(domain)}, onkeydown:e=>{this.#delDomain(domain)}}, '✖')),
                //th(a(Ui.extLink({href:`https://${domain}/`}), domain), a({onclick:e=>{this.#delDomain(domain)}, onkeydown:e=>{this.#delDomain(domain)},style:`cursor:pointer;`,tabindex:0}, '✖')),
                th(a(Ui.extLink({href:`https://${domain}/`}), domain), a({onclick:e=>{this.#delDomain(domain)}, onkeydown:e=>{if([' ','Enter','Del'].some(v=>v===e.key)){e.preventDefault();this.#delDomain(domain);}},style:`cursor:pointer;`,tabindex:0}, '✖')),
                //td(Ui.user(serviceKey, domain, inss.get(domain).user.name)),
                td(Ui.user(this._serviceKey, domain, inss.filter(ins=>ins.domain===domain)[0].user.name)),
            ))
        }
        console.log(trs)
        return trs
    }
    /*
    makeTr(item) { return tr(
        th(a(Ui.extLink({href:`https://${item.domain}/`}), item.domain), a({onclick:e=>{this.#delDomain(item.domain)}, onkeydown:e=>{this.#delDomain(item.domain)},style:`cursor:pointer;`}, '✖')),
        td(Ui.user(this._serviceKey, item.domain, item.user.name)),
    )}
    */
    #addDomain(domain) { if(0<this.items.filter(item=>item.domain===domain).length) { console.warn(`入力したドメイン名${domain}は既存のため追加を中断しました。`); return; } this.items.push(({domain:domain, user:{id:null,name:''}})) }
    #delDomain(domain) { this._items.splice(this._items.findIndex(v=>v.domain===domain), 1); console.log('#delDomain():',domain,this._items); }
}
class WebServiceTable {
    constructor() {
        this._s = new WebService()
    }
    make() { return table(...this.#makeSilos(), ...this.#makeFederateds()) }
    #makeSilos() { return this._s.siloArray.map(([k,v])=>tr(th({colspan:2},a(this.#extLink({href:`https://${v.domain}/`,style:`display:block;`}), v.name)), this.#user(k))) }
    //#makeSilos() { return this._s.silos.map(([k,v])=>tr(th({colspan:2},a(this.#extLink({href:`https://${v.domain}/`,style:`display:block;`}), v.name)), this.#user(k))) }
    /*
    #makeFederateds() {
return this._s.federateds.map(([k,v],i)=>tr(((0===i) ? th(a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : ''), th(a(this.#extLink({href:`https://${v.}`})))
    }
    */
    #makeFederateds() {
        console.log('#makeFederateds()')
        const trs = []
        //for (let serviceKey of this.federateds.keys()) {
        for (let serviceKey of this._s.federateds().keys()) {
            trs.push(...this.#makeFederated(serviceKey))
        }
        return trs
        return this.federateds().keys().map(k=>this.#makeFederated(serviceKey)).flat()
    }
    #makeFederated(serviceKey) {
        console.log('#makeFederated(serviceKey)')
        const trs = []
        //console.log(this._s.federateds(serviceKey))
        //const inss = this._s.federateds(serviceKey).instances
        const inss = this._s.items.get(serviceKey).instances
        const ui = this._s.items.get(serviceKey).ui
        console.log(inss, ui.items)
//        const insUi = new InstanceUi(serviceKey)
        //for (let domain of this.federateds.get(serviceKey).instances.keys()) {
        for (let domain of inss.keys()) {
            trs.push(tr(
                //((0===trs.length) ? th({rowspan:this.federateds.get(serviceKey).instances.size()}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                //((0===trs.length) ? th({rowspan:inss.size}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${v.name}`,style:`display:block;`}), v.name)) : null),
                //((0===trs.length) ? th({rowspan:inss.size}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${serviceKey}`,style:`display:block;`}), serviceKey), insUi.makeDomain()) : null),
                ((0===trs.length) ? th({rowspan:inss.size+ui.items.length}, a(this.#extLink({href:`https://ja.wikipedia.org/wiki/${serviceKey}`,style:`display:block;`}), serviceKey), ui.makeDomain()) : null),
                th(a(this.#extLink({href:`https://${domain}/`,style:`display:block;`}), domain)),
                td(this.#user(serviceKey, domain, inss.get(domain).user.name)),
            ))
        }
//        console.log(ui.makeTrs())
        console.log(serviceKey, trs)
        //vanX.list(table, this.items, item=>ui.makeTr(item))
        ui.makeTrs().forEach(tr=>trs.push(tr))
        //trs.concat(ui.makeTrs())
        //trs = trs.concat(ui.makeTrs())
        console.log(serviceKey, trs)
        return trs
    }
    /*
    #makeFederated() {
        const trs = []
        trs.push()
        for (let serviceKey of this.federateds.keys()) {
            for (let domain of this.federateds[serviceKey].instances.keys()) {
                
            }
        }

        return this._s.federateds.map(([k,v],i)
        return trs
    }
    */
    //#externLinkAttr() { return {target:'_blank', rel:'noopener noreferrer'} }
    #extLink(obj) { return {...obj, target:'_blank', rel:'noopener noreferrer'} }
    #user(s, d, v) { return input({id:`webservice-${s}((d) ? '-'+d: '')`, placeholder:'ユーザ名', value:((v) ? v : '')}) }
}

class Ui {
    static extLink(obj) { return {...obj, target:'_blank', rel:'noopener noreferrer'} }
//    dispBlock(obj) { return {...obj, style:`${((obj.hasOwnProperty('style')) ? obj.style : '')}display:block;`} }
    static user(s, d, v) { return input({id:`webservice-${s}((d) ? '-'+d: '')`, placeholder:'ユーザ名', value:((v) ? v : '')}) }
}
window.webServiceTable = new WebServiceTable()
})()
