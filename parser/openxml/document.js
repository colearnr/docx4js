define(['../document','./part'],function(Super,Part){
	return Super.extend(function(){
			Super.apply(this,arguments)
			var rels=this.rels={}
			$.each(new Part("",this).rels,function(id,rel){
				rels[rel.type]=rel.target
			})
			this.partMain=new Part(this.rels['officeDocument'],this)
			this.content=[]
		},{
		vender:"Microsoft",
		product:'Office 2010',
		getPart:function(name){
			var part=this.parts[name] || ((name=this.rels[name])&&this.parts[name])
			if(!part)
				return null

			if(Part.is(part))
				return part

			return this.parts[name]=new Part(name,this)
		},
		parse: function(){
			Super.prototype.parse.apply(this,arguments)
			this.getPart('core-properties').documentElement
			.$('keywords,description,title').forEach(function(x){
				var v=x.textContent.trim();
				v.length && (this[x.localName]=v)
			},this.props)
			typeof this.props.keywords!='undefined' && (this.props.keywords=this.props.keywords.split(','));

			this.getPart('extended-properties').documentElement
			.$('Template').forEach(function(x){
				var v=x.textContent.trim();
				v.length && (this[x.localName]=v)
			},this.props)
		}
	},{
		Visitor: $.newClass(function Any(srcModel, targetParent){
				this.srcModel=srcModel
				this.parent=parent
			},{
				visit: function(){
					console.info(this.srcModel.type)
				},
				_shouldIgnore: function(){
					return false
				}
			}),
		createVisitorFactory: function(factory, opt){
			var Any=this.Visitor
			switch(typeof factory){
			case 'function':
				break
			case 'object':
				var rawMap=factory;
				factory=function(srcModel, targetParent){
					var map=factory.map
					if(map['*'])
						Any=map['*'];
					var Visitor=map[srcModel.type], visitor, t;
					if(!srcModel.type)
						;
					else if(Visitor)
						visitor=new Visitor(srcModel, targetParent)
					else if((t=srcModel.type.split('.')).length>1){
						do{
							t.pop()
							if((Visitor=map[t.join('.')])){
								visitor=new Visitor(srcModel, targetParent)
								break
							}
						}while(t.length>1)
					}

					if(!visitor)
						visitor=new Any(srcModel, targetParent);

					if(!visitor._shouldIgnore())
						return visitor
				}

				factory.map=rawMap
				break
			case 'undefined':
				factory=function(srcModel, targetParent){
					return new Any(srcModel, targetParent)
				}
				break
			default:
				throw 'unsupported factory'
			}
			if(opt){
				var _raw=factory
				factory=function(){
					var converter=_raw.call(null,arguments)
					converter && (converter.options=opt);
					return converter
				}
				if(typeof _raw.map!=undefined)
					factory.map=_raw.map
			}

			factory.with=function(targetParent){
				function paramizedFactory(srcModel){
					return factory(srcModel, targetParent)
				}
				paramizedFactory.with=factory.with
				return paramizedFactory
			}

			return factory
		}
	})
})
