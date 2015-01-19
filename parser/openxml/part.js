define([],function(){
	return $.newClass(function(name,doc){
			this.name=name
			this.doc=doc
			this.documentElement=doc.parts[name] && $.parseXML(doc.parts[name].asText()).documentElement
			this.rels={}

			var folder="",
				relName="_rels/"+name+".rels",
				i=name.lastIndexOf('/');
			if(i!==-1){
				folder=name.substring(0,i)
				relName=folder+"/_rels/"+name.substring(i+1)+".rels";
			}

			if(!doc.parts[relName]) return;
			$.parseXML(doc.parts[relName].asText()).documentElement.$('Relationship').asArray()
			.forEach(function(a){
				this.rels[a.getAttribute('Id')]={
					type:a.getAttribute('Type').split('/').pop(),
					target:(folder ? (folder+"/") : '')+a.getAttribute('Target')}
			},this)
		},{
		getRel:function(id){
			var rel=this.rels[id]
			if (!rel) {
				return null;
			}
			switch(rel.type){
			case 'image':
				return this.doc.getImagePart(rel.target)
			case 'hyperlink':
				var target = rel.target;
				if (target) {
					target = target.replace('word/', '');
				}
				return target;
			default:
				return this.doc.getPart(rel.target)
			}
		},

	},{
		is:function(o){
			return o && o.getRel
		}
	})
})
