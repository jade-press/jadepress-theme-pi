

module.exports = function(_this) {


'use strict'

/**
 * catogory
 */

var _ = _this._
,local = _this.local
,setting = _this.setting
,tools = _this.tools
,log = _this.log
,err = _this.err
,db = _this.db
,cf = _this.cf
,path = require('path')
,baseThemeViewPath = _this.baseThemeViewPath
,Pager = _this.Pager
,pager = _this.pager
,getAllCats = _this.getAllCats

var extend = {}

extend.home = function* (next) {

	try {

		let sea = {}
		let query = this.query
		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = this.session.user
		this.local.user = user

		let sortOption = {
			createTime: -1
		}

		let total = yield db.post.count(sea)
		let posts = yield db.post.find(sea)
			.then( cf.skip( (page - 1) * pageSize ) )
			.then( cf.limit(pageSize) )
			.then( cf.sort(sortOption) )
			.then( cf.toArray )

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: total
			,url: this.path
		})

		var cats = yield getAllCats()

		_.extend(this.local, {
			pager: pagerHtml
			,pageSize: pageSize
			,total: total
			,posts: posts
			,themeRes: this.local.host + '/' + setting.theme
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: cats
		})

		this.render(baseThemeViewPath + 'home', this.local)

	} catch(e) {

		err('failed render home page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}

extend.post = function* (next) {

	try {

		let params = this.params
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let user = this.session.user
		this.local.user = user

		let post = yield db.post.findOne(sea)

		if(!post) return yield next

		var cats = yield getAllCats()

		_.extend(this.local, {
			post: post
			,publicRoute: setting.publicRoute
			,createUrl:tools.createUrl
			,themeRes: this.local.host + '/' + setting.theme
			,cats: cats
		})
		
		this.render(baseThemeViewPath + '/post', this.local)

	} catch(e) {

		err('failed render single post page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}

extend.cat = function* (next) {

	try {

		let params = this.params
		let query = this.query
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let catObj = yield db.cat.findOne(sea)
		if(!catObj) return yield next

		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = this.session.user
		this.local.user = user

		let sea1 = {
			'cats._id': catObj._id
		}

		let sortOption = {
			createTime: -1
		}

		let total = yield db.post.count(sea1)
		let posts = yield db.post.find(sea1)
			.then( cf.skip( (page - 1) * pageSize ) )
			.then( cf.limit(pageSize) )
			.then( cf.sort(sortOption) )
			.then( cf.toArray )

		var cats = yield getAllCats()

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: total
			,url: this.path
		})

		_.extend(this.local, {
			posts: posts
			,page: page
			,pageSize: pageSize
			,total: total
			,cat: catObj
			,pager: pagerHtml
			,themeRes: this.local.host + '/' + setting.theme
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: cats
		})

		this.local.posts = posts

		this.render(baseThemeViewPath + 'category', this.local)

	} catch(e) {

		err('failed render cat page', e)
		this.status = 500
		this.local.error = e
		this.render('views/page/500', this.local)

	}

}


return extend

////end
}
