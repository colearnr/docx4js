/**
 *  a type of document parser
 *  @class Document
 *  @requires module:JSZip
 */
define(['jszip'],function(JSZip){
	return $.newClass(function(parts,raw,props){
		this.parts=parts
		this.raw=raw
		this.props=props
	},{
		getPart:function(name){
			return this.parts[name]
		},
		getImagePart:function(name){
			return this.parts[name].asArrayBuffer()
		},
		parse: function(){},
		release: function(){}
	},{
		load: function(inputFile){
			var reader=new FileReader(),
				p=new $.Deferred(),
				DocumentSelf=this
			reader.onload=function(e){
				var raw=new JSZip(e.target.result),parts={}
				raw.filter(function(path,file){
					parts[path]=file
				})
				p.resolve(new DocumentSelf(parts,raw,{name:inputFile.name,lastModified:inputFile.lastModified,size:inputFile.size}))
			}
			reader.readAsArrayBuffer(inputFile);
			return p
		}
	})
})
