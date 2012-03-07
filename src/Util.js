//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE Utils
//
// The here-listed methods are utility methods for the day-to-day 
// VIE.js usage. All methods are within the static namespace ```VIE.Util```.
VIE.Util = {

// ### VIE.Util.toCurie(uri, safe, namespaces)
// This method converts a given 
// URI into a CURIE (or SCURIE), based on the given ```VIE.Namespaces``` object.
// If the given uri is already a URI, it is left untouched and directly returned.
// If no prefix could be found, an ```Error``` is thrown.  
// **Parameters**:  
// *{string}* **uri** The URI to be transformed.  
// *{boolean}* **safe** A flag whether to generate CURIEs or SCURIEs.  
// *{VIE.Namespaces}* **namespaces** The namespaces to be used for the prefixes.  
// **Throws**:  
// *{Error}* If no prefix could be found in the passed namespaces.  
// **Returns**:  
// *{string}* The CURIE or SCURIE.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     VIE.Util.toCurie(uri, false, ns); // --> dbp:Person
//     VIE.Util.toCurie(uri, true, ns); // --> [dbp:Person]
	toCurie : function (uri, safe, namespaces) {
        if (VIE.Util.isCurie(uri, namespaces)) {
            return uri;
        }
        var delim = ":";
        for (var k in namespaces.toObj()) {
            if (uri.indexOf(namespaces.get(k)) === 1) {
                var pattern = new RegExp("^" + "<?" + namespaces.get(k));
                if (k === '') {
                    delim = '';
                }
                return ((safe)? "[" : "") + 
                        uri.replace(pattern, k + delim).replace(/>$/, '') +
                        ((safe)? "]" : "");
            }
        }
        throw new Error("No prefix found for URI '" + uri + "'!");
    },

// ### VIE.Util.isCurie(curie, namespaces)
// This method checks, whether 
// the given string is a CURIE and returns ```true``` if so and ```false```otherwise.  
// **Parameters**:  
// *{string}* **curie** The CURIE (or SCURIE) to be checked.  
// *{VIE.Namespaces}* **namespaces** The namespaces to be used for the prefixes.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* ```true``` if the given curie is a CURIE or SCURIE and ```false``` otherwise.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     var text = "This is some text.";
//     VIE.Util.isCurie(uri, ns);    // --> false
//     VIE.Util.isCurie(curie, ns);  // --> true
//     VIE.Util.isCurie(scurie, ns); // --> true
//     VIE.Util.isCurie(text, ns);   // --> false
    isCurie : function (curie, namespaces) {
        if (VIE.Util.isUri(curie)) {
            return false;
        } else {
            try {
                VIE.Util.toUri(curie, namespaces);
                return true;
            } catch (e) {
                return false;
            }
        }
    },

// ### VIE.Util.toUri(curie, namespaces)
// This method converts a 
// given CURIE (or save CURIE) into a URI, based on the given ```VIE.Namespaces``` object.  
// **Parameters**:  
// *{string}* **curie** The CURIE to be transformed.  
// *{VIE.Namespaces}* **namespaces** The namespaces object  
// **Throws**:  
// *{Error}* If no URI could be assembled.  
// **Returns**:  
// *{string}* : A string, representing the URI.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     VIE.Util.toUri(curie, ns); 
//          --> <http://dbpedia.org/ontology/Person>
//     VIE.Util.toUri(scurie, ns);
//          --> <http://dbpedia.org/ontology/Person>
    toUri : function (curie, namespaces) {
        var delim = ":";
        for (var prefix in namespaces.toObj()) {
            if (prefix !== "" && (curie.indexOf(prefix + ":") === 0 || curie.indexOf("[" + prefix + ":") === 0)) {
                var pattern = new RegExp("^" + "\\[{0,1}" + prefix + delim);
                return "<" + curie.replace(pattern, namespaces.get(prefix)).replace(/\]{0,1}$/, '') + ">";
            }
        }
        /* check for the default namespace */
        if (curie.indexOf(delim) === -1) {
            return "<" + namespaces.base() + curie + ">";
        }
        throw new Error("No prefix found for CURIE '" + curie + "'!");
    },
    
// ### VIE.Util.isUri(something)
// This method checks, whether the given string is a URI.  
// **Parameters**:  
// *{string}* **something** : The string to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* : ```true``` if the string is a URI, ```false``` otherwise.  
// **Example usage**: 
//
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     var curie = "dbp:Person";
//     VIE.Util.isUri(uri);   // --> true
//     VIE.Util.isUri(curie); // --> false
    isUri : function (something) {
        return (typeof something === "string" && something.search(/^<.+>$/) === 0);
    },
    
// ### VIE.Util.rdf2Entities(service, results)
// This method converts *rdf/json* data from an external service
// into VIE.Entities.  
// **Parameters**:  
// *{object}* **service** The service that retrieved the data.  
// *{object}* **results** The data to be transformed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{[VIE.Entity]}* : An array, containing VIE.Entity instances which have been transformed from the given data.
    rdf2Entities: function (service, results) {
        if (typeof jQuery.rdf !== 'function') {
            /* fallback if no rdfQuery has been loaded */
            return VIE.Util._rdf2EntitiesNoRdfQuery(service, results);
        }
        try {
	        var rdf = (results instanceof jQuery.rdf)? results : jQuery.rdf().load(results, {});
	
	        rdf.base(service.vie.namespaces.base());
	        /* if the service contains rules to apply special transformation, they are executed here.*/
	        if (service.rules) {
	            var rules = jQuery.rdf.ruleset();
	            for (var prefix in service.vie.namespaces.toObj()) {
	                if (prefix !== "") {
	                    rules.prefix(prefix, service.vie.namespaces.get(prefix));
	                }
	            }
	            for (var i = 0; i < service.rules.length; i++)if(service.rules.hasOwnProperty(i)) {
	                var rule = service.rules[i];
	                rules.add(rule['left'], rule['right']);
	            }
	            rdf = rdf.reason(rules, 10); /* execute the rules only 10 times to avoid looping */
	        }
	        var entities = {};
	        rdf.where('?subject ?property ?object').each(function() {
	            var subject = this.subject.toString();
	            if (!entities[subject]) {
	                entities[subject] = {
	                    '@subject': subject,
	                    '@context': service.vie.namespaces.toObj(true),
	                    '@type': []
	                };
	            }
	            var propertyUri = this.property.toString();
	            var propertyCurie;
	
	            try {
	                propertyCurie = service.vie.namespaces.curie(propertyUri);
	                //jQuery.createCurie(propertyUri, {namespaces: service.vie.namespaces.toObj(true)});
	            } catch (e) {
	                propertyCurie = propertyUri;
	                console.warn(propertyUri + " doesn't have a namespace definition in '", service.vie.namespaces.toObj());
	            }
	            entities[subject][propertyCurie] = entities[subject][propertyCurie] || [];
	
	            function getValue(rdfQueryLiteral){
	                if(typeof rdfQueryLiteral.value === "string"){
	                    if (rdfQueryLiteral.lang){
	                        var literal = {
	                            toString: function(){
	                                return this["@value"];
	                            },
	                            "@value": rdfQueryLiteral.value.replace(/^"|"$/g, ''),
	                            "@language": rdfQueryLiteral.lang
	                        };
	                        return literal;
	                    }
	                    else
	                        return rdfQueryLiteral.value;
	                    return rdfQueryLiteral.value.toString();
	                } else if (rdfQueryLiteral.type === "uri"){
	                    return rdfQueryLiteral.toString();
	                } else {
	                    return rdfQueryLiteral.value;
	                }
	            }
	            entities[subject][propertyCurie].push(getValue(this.object));
	        });
	
	        _(entities).each(function(ent){
	            ent["@type"] = ent["@type"].concat(ent["rdf:type"]);
	            delete ent["rdf:type"];
	            _(ent).each(function(value, property){
	                if(value.length === 1){
	                    ent[property] = value[0];
	                }
	            });
	        });
	
	        var vieEntities = [];
	        jQuery.each(entities, function() {
	            var entityInstance = new service.vie.Entity(this);
	            entityInstance = service.vie.entities.addOrUpdate(entityInstance);
	            vieEntities.push(entityInstance);
	        });
	        return vieEntities;
        } catch (e) {
        	console.warn("Something went wrong while parsing the returned results!", e);
        	return [];
        }
    },
    
// ### VIE.Util._rdf2EntitiesNoRdfQuery(service, results)
// This is a **private** method which should
// only be accessed through ```VIE.Util._rdf2Entities()``` and is a helper method in case there is no
// rdfQuery loaded (*not recommended*).  
// **Parameters**:  
// *{object}* **service** The service that retrieved the data.  
// *{object}* **results** The data to be transformed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{[VIE.Entity]}* : An array, containing VIE.Entity instances which have been transformed from the given data.
    _rdf2EntitiesNoRdfQuery: function (service, results) {
        var jsonLD = [];
        _.forEach(results, function(value, key) {
            var entity = {};
            entity['@subject'] = '<' + key + '>';
            _.forEach(value, function(triples, predicate) {
                predicate = '<' + predicate + '>';
                _.forEach(triples, function(triple) {
                    if (triple.type === 'uri') {
                        triple.value = '<' + triple.value + '>';
                    }

                    if (entity[predicate] && !_.isArray(entity[predicate])) {
                        entity[predicate] = [entity[predicate]];
                    }

                    if (_.isArray(entity[predicate])) {
                        entity[predicate].push(triple.value);
                        return;
                    }
                    entity[predicate] = triple.value;
                });
            });
            jsonLD.push(entity);
        });
        return jsonLD;
    },

// ### VIE.Util.loadSchemaOrg(vie, SchemaOrg, baseNS)
// This method is a wrapper around
// the <a href="http://schema.org/">schema.org</a> ontology. It adds all the
// given types and properties as ```VIE.Type``` instances to the given VIE instance.
// If the paramenter **baseNS** is set, the method automatically sets the namespace
// to the provided one. If it is not set, it will keep the base namespace of VIE untouched.  
// **Parameters**:  
// *{VIE}* **vie** The instance of ```VIE```.   
// *{object}* **SchemaOrg** The data imported from schema.org.   
// *{string|undefined}* **baseNS** If set, this will become the new baseNamespace within the given ```VIE``` instance.   
// **Throws**:  
// *{Error}* If the parameter was not given.  
// **Returns**:  
// *nothing*
    loadSchemaOrg : function (vie, SchemaOrg, baseNS) {
    
        if (!SchemaOrg) {
            throw new Error("Please load the schema.json file.");
        }
        vie.types.remove("<http://schema.org/Thing>");
        
        var baseNSBefore = (baseNS)? baseNS : vie.namespaces.base();
        vie.namespaces.base(baseNS);
        
        var datatypeMapping = {
            'DataType': 'xsd:anyType',
            'Boolean' : 'xsd:boolean',
            'Date'    : 'xsd:date',
            'Float'   : 'xsd:float',
            'Integer' : 'xsd:integer',
            'Number'  : 'xsd:anySimpleType',
            'Text'    : 'xsd:string',
            'URL'     : 'xsd:anyURI'
        };
        
        var dataTypeHelper = function (ancestors, id) {
            var type = vie.types.add(id, [{'id' : 'value', 'range' : datatypeMapping[id]}]);
            
            for (var i = 0; i < ancestors.length; i++) {
                var supertype = (vie.types.get(ancestors[i]))? vie.types.get(ancestors[i]) :
                    dataTypeHelper.call(vie, SchemaOrg["datatypes"][ancestors[i]].supertypes, ancestors[i]);
                type.inherit(supertype);
            }
            return type;
        };
        
        for (var dt in SchemaOrg["datatypes"]) {
            if (!vie.types.get(dt)) {
                var ancestors = SchemaOrg["datatypes"][dt].supertypes;
                dataTypeHelper.call(vie, ancestors, dt);
            }
        }
        
        var typeProps = function (id) {
            var props = [];
            var specProps = SchemaOrg["types"][id]["specific_properties"];
            for (var p = 0; p < specProps.length; p++) {
                var pId = specProps[p];
                var range = SchemaOrg["properties"][pId]["ranges"];
                props.push({
                    'id'    : pId,
                    'range' : range
                });
            }
            return props;
        };
        
        var typeHelper = function (ancestors, id, props) {
            var type = vie.types.add(id, props);
           
            for (var i = 0; i < ancestors.length; i++) {
                var supertype = (vie.types.get(ancestors[i]))? vie.types.get(ancestors[i]) :
                    typeHelper.call(vie, SchemaOrg["types"][ancestors[i]].supertypes, ancestors[i], typeProps.call(vie, ancestors[i]));
                type.inherit(supertype);
            }
            if (id === "Thing" && !type.isof("owl:Thing")) {
                type.inherit("owl:Thing");
            }
            return type;
        };
        
        for (var t in SchemaOrg["types"]) {
            if (!vie.types.get(t)) {
                var ancestors = SchemaOrg["types"][t].supertypes;
                typeHelper.call(vie, ancestors, t, typeProps.call(vie, t));
            }
        }
        /* set the namespace to either the old value or the provided baseNS value */
        vie.namespaces.base(baseNSBefore);
    },

// ### VIE.Util.xsdDateTime(date)
// This transforms a ```Date``` instance into an xsd:DateTime format.  
// **Parameters**:  
// *{```Date```}* **date** An instance of a javascript ```Date```.  
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{string}* A string representation of the dateTime in the xsd:dateTime format.
    xsdDateTime : function(date) {
        function pad(n) {
            var s = n.toString();
            return s.length < 2 ? '0'+s : s;
        };

        var yyyy = date.getFullYear();
        var mm1  = pad(date.getMonth()+1);
        var dd   = pad(date.getDate());
        var hh   = pad(date.getHours());
        var mm2  = pad(date.getMinutes());
        var ss   = pad(date.getSeconds());

        return yyyy +'-' +mm1 +'-' +dd +'T' +hh +':' +mm2 +':' +ss;
    },
    
// ### VIE.Util.transformationRules(service)
// This returns a default set of rdfQuery rules that transform semantic data into the
// VIE entity types.  
// **Parameters**:  
// *{object}* **service** An instance of a vie.service.  
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{array}* An array of rules with 'left' and 'right' side.
    transformationRules : function (service) {
        var res = [
            // rule(s) to transform a dbpedia:Person into a VIE:Person
             {
                'left' : [
                    '?subject a dbpedia:Person',
                    '?subject rdfs:label ?label'
                 ],
                 'right': function(ns){
                     return function(){
                         return [
                             jQuery.rdf.triple(this.subject.toString(),
                                 'a',
                                 '<' + ns.base() + 'Person>', {
                                     namespaces: ns.toObj()
                                 }),
                             jQuery.rdf.triple(this.subject.toString(),
                                 '<' + ns.base() + 'name>',
                                 this.label, {
                                     namespaces: ns.toObj()
                                 })
                             ];
                     };
                 }(service.vie.namespaces)
             },
             // rule(s) to transform a foaf:Person into a VIE:Person
             {
             'left' : [
                     '?subject a foaf:Person',
                     '?subject rdfs:label ?label'
                  ],
                  'right': function(ns){
                      return function(){
                          return [
                              jQuery.rdf.triple(this.subject.toString(),
                                  'a',
                                  '<' + ns.base() + 'Person>', {
                                      namespaces: ns.toObj()
                                  }),
                              jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                                  this.label, {
                                      namespaces: ns.toObj()
                                  })
                              ];
                      };
                  }(service.vie.namespaces)
              },
             // rule(s) to transform a dbpedia:Place into a VIE:Place
             {
                 'left' : [
                     '?subject a dbpedia:Place',
                     '?subject rdfs:label ?label'
                  ],
                  'right': function(ns) {
                      return function() {
                          return [
                          jQuery.rdf.triple(this.subject.toString(),
                              'a',
                              '<' + ns.base() + 'Place>', {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                              this.label.toString(), {
                                  namespaces: ns.toObj()
                              })
                          ];
                      };
                  }(service.vie.namespaces)
              },
             // rule(s) to transform a dbpedia:City into a VIE:City
              {
                 'left' : [
                     '?subject a dbpedia:City',
                     '?subject rdfs:label ?label',
                     '?subject dbpedia:abstract ?abs',
                     '?subject dbpedia:country ?country'
                  ],
                  'right': function(ns) {
                      return function() {
                          return [
                          jQuery.rdf.triple(this.subject.toString(),
                              'a',
                              '<' + ns.base() + 'City>', {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                              this.label.toString(), {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'description>',
                              this.abs.toString(), {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'containedIn>',
                              this.country.toString(), {
                                  namespaces: ns.toObj()
                              })
                          ];
                      };
                  }(service.vie.namespaces)
              },
        ];
        return res;
    }
};

