namespace $.$$ {

	export type $hyoo_rdf_resource_key = { subject : string , predicate : string , index : number }

	export class $hyoo_rdf extends $.$hyoo_rdf {

		uri( next? : string ) {
			return this.$.$mol_state_arg.value( 'uri' , next ) || super.uri()
		}

		@ $mol_mem
		response() {
			return this.$.$mol_fetch.xml( this.uri() , {
				headers : {
					Accept : 'application/rdf+xml' ,
				} ,
			} )
		}

		@ $mol_mem
		data() {
			const data = {} as Record< string , Record< string , { resource : string , value : string }[] > >

			for( const descr of this.response().documentElement.children ) {

				const rel = descr.getAttributeNS( 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' , 'about' )!
				const abs = new URL( rel , this.uri() ).toString()
				data[ abs ] = data[ abs ] || {}
				
				for( const item of descr.children ) {
					
					const pred = item.namespaceURI + item.localName

					let resource = item.getAttributeNS( 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' , 'resource' )!
					if( resource != null ) resource = new URL( resource , this.uri() ).toString()
					
					const value = item.textContent!
					
					data[ abs ][ pred ] = data[ abs ][ pred ] || []
					data[ abs ][ pred ].push({
						resource ,
						value ,
					})
					
				}

			}

			return data
		}

		@ $mol_mem
		subject_rows() {
			const data = this.data()
			return Object.keys( data ).map( subject => this.Subject_row( subject ) )
		}

		subject_title( uri : string ) {
			return decodeURIComponent( uri.replace( /.*[\/#]/ , '' ) ) || '#'
		}

		subject_uri( uri : string ) {
			return this.$.$mol_state_arg.link({ uri })
		}

		@ $mol_mem_key
		predicate_rows( subject : string ) {
			const data = this.data()[ subject ]
			return Object.keys( data ).map( predicate => this.Predicate_row({ subject , predicate }) )
		}

		predicate_title( { subject , predicate } : { subject : string , predicate : string } ) {
			return decodeURIComponent( predicate.replace( /.*[\/#]/ , '' ) ) || '#'
		}

		predicate_uri( { subject , predicate } : { subject : string , predicate : string } ) {
			return this.$.$mol_state_arg.link({ uri : predicate })
		}

		@ $mol_mem_key
		object_rows( { subject , predicate } : { subject : string , predicate : string } ) {
			const data = this.data()[ subject ][ predicate ]

			return data.map((val, index) => {
				if( val.resource ) return this.Resource({ subject , predicate , index })
				return this.Value({ subject , predicate , index })
			})
		}

		resource_title( { subject , predicate , index } : $hyoo_rdf_resource_key ) {
			const data = this.data()[ subject ][ predicate ][ index ]
			return decodeURIComponent( data.resource.replace( /.*[\/#]/ , '' ) ) || '#'
		}

		resource_uri( { subject , predicate , index } : $hyoo_rdf_resource_key ) {
			const data = this.data()[ subject ][ predicate ][ index ]
			return this.$.$mol_state_arg.link({ uri : data.resource })
		}

		value( { subject , predicate , index } : $hyoo_rdf_resource_key ) {
			return this.data()[ subject ][ predicate ][ index ].value
		}

	}

}
