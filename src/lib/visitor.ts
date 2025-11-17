import { Token, TokenType } from "@jwstott/odata-v4-parser/lib/lexer";
import { Literal } from "odata-v4-literal";
import { SQLLiteral, SQLLang, Visitor } from "odata-v4-sql/lib/visitor";
import { SqlOptions } from "./index";

export class PGVisitor extends Visitor {
	parameters: any[] = [];
	includes: PGVisitor[] = [];

	constructor(options = <SqlOptions>{}) {
		super(options);
		(<any>this).parameters = [];
		this.type = SQLLang.PostgreSql;
	}
	/**
	 * returns parameters as {0: 'abc', 1: '2019', ...}
	 */
	public parameterObject() {
		return Object.assign({}, this.parameters)
	}

	from(table: string) {
		let sql = `SELECT ${this.select} FROM ${table} WHERE ${this.where} ORDER BY ${this.orderby}`;
		if (typeof this.limit == "number") sql += ` LIMIT ${this.limit}`;
		if (typeof this.skip == "number") sql += ` OFFSET ${this.skip}`;
		return sql;
	}

	Visit(node:Token, context?:any){
		this.ast = this.ast || node;
		context = context || { target: "where" };

		if (node && node.type){
			var visitor = this[`Visit${node.type}`];
			if (visitor) {
				visitor.call(this, node, context);
			} else {
				// IsNullExpression = "IsNullExpression",
				if (!['IsNullExpression','IsNullExpression'].includes(node.type) ) {
					console.log(`Unhandled node type: ${node.type}`, node);
				}
			}
		}

		if (node == this.ast){
			if (!this.select) this.select = `*`;
			if (!this.where) this.where = "1 = 1";
			if (!this.orderby) this.orderby = "1";
		}
		return this;
	}

	protected VisitExpand(node: Token, context: any) {
		node.value.items.forEach((item) => {
			let expandPath = item.value.path.raw;
			let visitor = this.includes.filter(v => v.navigationProperty == expandPath)[0];
			if (!visitor) {
				visitor = new PGVisitor(this.options);
				visitor.parameterSeed = this.parameterSeed;
				this.includes.push(visitor);
			}
			visitor.Visit(item);
			this.parameterSeed = visitor.parameterSeed;
		});
	}
	protected toSnakeCase(str: string) {
		return str &&
			str
				.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
				.map(x => x.toLowerCase())
				.join('_');
	}
	protected VisitSelectItem(node: Token, context: any) {
		let item = node.raw.replace(/\//g, '.');
		this.select += `"${item}"`;
	}

	/* Allow for table/column naming patterns, replace traditional "." separators with
	 double underscore __, and identifier will be replaced with "xxx"."yyyy" for the
	 where clause.
	*/
	protected VisitODataIdentifier(node: Token, context: any) {

		let colNames = node.value.name.split('__');
		colNames = colNames.map(this.toSnakeCase);
		if (colNames.length > 0) {     //  this[context.target] += `"${colNames[0]}"."${colNames[1]}"`;
			let colParsed = '';
			colNames.forEach(col => {
				colParsed += `"${col}".`;
			}); // 
			this[context.target] += colParsed.slice(0, -1); // remove the last character '.'
		}
		context.identifier = node.value.name;
		/* let target = node.value.name.replace(/(.)([A-Z][a-z]+)/, '$1_$2').replace(/([a-z0-9])([A-Z])/, '$1_$2').toLowerCase(); // convert to snake_case
		this[context.target] += `"${target}"`;
		context.identifier = node.value.name; */
	}

	// path expressions specify the items to be retrieved from the JSON data
	// WHERE metadata->>'country'  ->> operator gets a JSON object field as text
	// ensure the first columName is snake_cased, don't touch others as they are json props
	protected VisitJsonPathExpression(node: Token, context: any) {
		let regEx = /^[\w]+/;
		let val = node.value || node.value.name;
		if (regEx.test(val)) {
			let firstColumnMatch = val.match(regEx);
			if (firstColumnMatch && firstColumnMatch.length > 0) {
				let column = firstColumnMatch[0];
				let colNames = column.split('__');
				colNames = colNames.map(this.toSnakeCase);
				if (colNames.length > 0) {     //  this[context.target] += `"${colNames[0]}"."${colNames[1]}"`;
					let colParsed = '';
					colNames.forEach(col => {
						colParsed += `"${col}".`;
					}); // 
					column = colParsed.slice(0, -1); // remove the last character '.'
				}
				let x = val.replace(regEx, column);
				val = x;
			}
		}
		this[context.target] += val;
		context.identifier = val;
	}

	protected VisitEqualsExpression(node: Token, context: any) {
		this.Visit(node.value.left, context);
		this.where += " = ";
		this.Visit(node.value.right, context);
		if (this.options.useParameters && context.literal == null) {
			this.where = this.where.replace(/= \:\d$/, "IS NULL").replace(new RegExp(`\\? = "${context.identifier}"$`), `"${context.identifier}" IS NULL`);
		} else if (context.literal == "NULL") {
			this.where = this.where.replace(/= NULL$/, "IS NULL").replace(new RegExp(`NULL = "${context.identifier}"$`), `"${context.identifier}" IS NULL`);
		}
	}

	protected VisitNotEqualsExpression(node: Token, context: any) {
		this.Visit(node.value.left, context);
		this.where += " <> ";
		this.Visit(node.value.right, context);
		if (this.options.useParameters && context.literal == null) {
			this.where = this.where.replace(/<> \:\d$/, "IS NOT NULL").replace(new RegExp(`\\? <> "${context.identifier}"$`), `"${context.identifier}" IS NOT NULL`);
		} else if (context.literal == "NULL") {
			this.where = this.where.replace(/<> NULL$/, "IS NOT NULL").replace(new RegExp(`NULL <> "${context.identifier}"$`), `"${context.identifier}" IS NOT NULL`);
		}
	}

	protected VisitLiteral(node: Token, context: any) {
		if (this.options.useParameters) {
			let value = Literal.convert(node.value, node.raw);
			context.literal = value;
			this.parameters.push(value);
			this.where += `:${this.parameters.length - 1}`;
		} else this.where += (context.literal = SQLLiteral.convert(node.value, node.raw));
	}

	protected VisitInExpression(node: Token, context: any) {
		this.Visit(node.value.left, context);
		this.where += " IN (";
		this.Visit(node.value.right, context);
		this.where += ":list)";
	}

	protected VisitArrayOrObject(node: Token, context: any) {
		if (this.options.useParameters) {
			let value = node.value.value.items.map(item => item.value === 'number' ? parseInt(item.raw, 10) : item.raw);
			context.literal = value;
			this.parameters.push(value);
			this.where += `:${this.parameters.length - 1}`;
		} else this.where += (context.literal = SQLLiteral.convert(node.value, node.raw));
	}

	protected VisitMethodCallExpression(node: Token, context: any) {
		var method = node.value.method;
		var params = node.value.parameters || [];
		switch (method) {
			case "whereJsonSupersetOf":
				this.Visit(params[0], context);
				if (this.options.useParameters) {
					let value = Literal.convert(params[1].value, params[1].raw);
					this.parameters.push(`${value}`);
					this.where += ` ~* :${this.parameters.length - 1}`;
				} else this.where += ` ~* '${SQLLiteral.convert(params[1].value, params[1].raw).slice(1, -1)}'`;
				break;

			case "contains":
				this.Visit(params[0], context);
				if (this.options.useParameters) {
					let value = Literal.convert(params[1].value, params[1].raw);
					this.parameters.push(`${value}`);
					this.where += ` ~* :${this.parameters.length - 1}`;
				} else this.where += ` ~* '${SQLLiteral.convert(params[1].value, params[1].raw).slice(1, -1)}'`;
				break;
			case "containsAny":
				this.where += "array_to_string(";
				this.Visit(params[0], context);
				this.where += ", ' ')";
				if (this.options.useParameters) {
					let value = Literal.convert(params[1].value, params[1].raw);
					this.parameters.push(`${value}`);
					this.where += ` ~* :${this.parameters.length - 1}`;
				} else this.where += ` ~* '${SQLLiteral.convert(params[1].value, params[1].raw).slice(1, -1)}'`;
				break;
			case "endswith":
				this.Visit(params[0], context);
				if (this.options.useParameters) {
					let value = Literal.convert(params[1].value, params[1].raw);
					this.parameters.push(`%${value}`);
					this.where += ` LIKE :${this.parameters.length - 1}`;
				} else this.where += ` ILIKE '%${SQLLiteral.convert(params[1].value, params[1].raw).slice(1, -1)}'`;
				break;
			case "startswith":
				this.Visit(params[0], context);
				if (this.options.useParameters) {
					let value = Literal.convert(params[1].value, params[1].raw);
					this.parameters.push(`${value}%`);
					this.where += ` ILIKE :${this.parameters.length - 1}`;
				} else this.where += ` ILIKE '${SQLLiteral.convert(params[1].value, params[1].raw).slice(1, -1)}%'`;
				break;
			case "substring":
				this.where += "SUBSTR(";
				this.Visit(params[0], context);
				this.where += ", ";
				this.Visit(params[1], context);
				this.where += " + 1";
				if (params[2]) {
					this.where += ", ";
					this.Visit(params[2], context);
				} else {
					this.where += ", CHAR_LENGTH(";
					this.Visit(params[0], context);
					this.where += ")";
				}
				this.where += ")";
				break;
			case "substringof":
				const regex = /:\d+$/g;
				this.Visit(params[1], context);
				// HACK - if using column placeholder, update as :0: vs :0, objection interprets :0: as column
				// this.where may include prior statements, looking for last entry of :[digits]
				if (this.where.match(regex)) {
					this.where += ':';
				}
				if (params[0].value == "Edm.String") {
					if (this.options.useParameters) {
						let value = Literal.convert(params[0].value, params[0].raw);
						this.parameters.push(`%${value}%`);
						this.where += ` ILIKE :${this.parameters.length - 1}`;
					} else this.where += ` ILIKE '%${SQLLiteral.convert(params[0].value, params[0].raw).slice(1, -1)}%'`;
				} else {
					this.where += " ILIKE ";
					this.Visit(params[0], context);
				}
				break;
			case "concat":
				this.where += "(";
				this.Visit(params[0], context);
				this.where += " || ";
				this.Visit(params[1], context);
				this.where += ")";
				break;
			case "round":
				this.where += "ROUND(";
				this.Visit(params[0], context);
				this.where += ")";
				break;
			case "length":
				this.where += "CHAR_LENGTH(";
				this.Visit(params[0], context);
				this.where += ")";
				break;
			case "tolower":
				this.where += "UPPER(";
				this.Visit(params[0], context);
				this.where += ")";
				break;
			case "toupper":
				this.where += "UPPER(";
				this.Visit(params[0], context);
				this.where += ")";
				break;
			case "floor":
			case "ceiling":
			case "year":
			case "month":
			case "day":
			case "hour":
			case "minute":
			case "second":
				this.where += `${method.toUpperCase()}(`;
				this.Visit(params[0], context);
				this.where += ")";
				break;
			case "now":
				this.where += "NOW()";
				break;
			case "trim":
				this.where += "TRIM(BOTH ' ' FROM ";
				this.Visit(params[0], context);
				this.where += ")";
				break;
		}
	}

	protected VisitIsNotNullExpression(node: Token, context: any) {
		this.Visit(node.value, context);

		// match any text wrapped in double quotes in node.value property
		// and convert that string to snake case while preserving table.column structure
		// for example: "vAsset.state" IS NOT NULL should be converted to: "v_asset"."state" IS NOT NULL

		let processedValue = node.value;
		
		// Handle table.column format (preserve the dot separator)
		let regEx = /"([^"]*\.[^"]*)"/g;
		let tableColumnMatches = processedValue.match(regEx);
		if (tableColumnMatches) {
			tableColumnMatches.forEach(match => {
				let cleanMatch = match.replace(/"/g, '');
				let parts = cleanMatch.split('.');
				if (parts.length === 2) {
					let snakeCaseTable = this.toSnakeCase(parts[0]);
					let snakeCaseColumn = this.toSnakeCase(parts[1]);
					processedValue = processedValue.replace(match, `"${snakeCaseTable}"."${snakeCaseColumn}"`);
				}
			});
		} else {
			// Handle single identifiers
			let regEx = /"([^"]*)"/g;
			let matches = processedValue.match(regEx);
			if (matches) {
				matches.forEach(match => {
					let snakeCaseMatch = this.toSnakeCase(match.replace(/"/g, ''));
					processedValue = processedValue.replace(match, `"${snakeCaseMatch}"`);
				});
			}
		}

		this.where += processedValue;
	}

	protected VisitIsNullExpression(node: Token, context: any) {
		// Don't call this.Visit(node.value, context) as it processes the identifier separately
		// and node.value already contains the properly formatted SQL
		
		// match any text wrapped in double quotes in node.value property
		// and convert that string to snake case while preserving table.column structure
		// for example: "vAsset.state" IS NULL should be converted to: "v_asset"."state" IS NULL

		let processedValue = node.value;
		
		// Handle table.column format (preserve the dot separator)
		let regEx = /"([^"]*\.[^"]*)"/g;
		let tableColumnMatches = processedValue.match(regEx);
		if (tableColumnMatches) {
			tableColumnMatches.forEach(match => {
				let cleanMatch = match.replace(/"/g, '');
				let parts = cleanMatch.split('.');
				if (parts.length === 2) {
					let snakeCaseTable = this.toSnakeCase(parts[0]);
					let snakeCaseColumn = this.toSnakeCase(parts[1]);
					processedValue = processedValue.replace(match, `"${snakeCaseTable}"."${snakeCaseColumn}"`);
				}
			});
		} else {
			// Handle single identifiers
			let regEx = /"([^"]*)"/g;
			let matches = processedValue.match(regEx);
			if (matches) {
				matches.forEach(match => {
					let snakeCaseMatch = this.toSnakeCase(match.replace(/"/g, ''));
					processedValue = processedValue.replace(match, `"${snakeCaseMatch}"`);
				});
			}
		}

		this.where += processedValue;
	}

	protected VisitIsNullOrEmptyExpression(node:Token, context:any){
		this.Visit(node.value, context);

		// match any text wrapped in double quotes in node.value property
		// and convert that string to snake case while preserving table.column structure
		// for example: "vAsset.state" IS NULL OR "vAsset.state" = '' should be converted to: "v_asset"."state" IS NULL OR "v_asset"."state" = ''

		let processedValue = node.value;
		
		// Handle table.column format (preserve the dot separator)
		let regEx = /"([^"]*\.[^"]*)"/g;
		let tableColumnMatches = processedValue.match(regEx);
		if (tableColumnMatches) {
			tableColumnMatches.forEach(match => {
				let cleanMatch = match.replace(/"/g, '');
				let parts = cleanMatch.split('.');
				if (parts.length === 2) {
					let snakeCaseTable = this.toSnakeCase(parts[0]);
					let snakeCaseColumn = this.toSnakeCase(parts[1]);
					processedValue = processedValue.replace(match, `"${snakeCaseTable}"."${snakeCaseColumn}"`);
				}
			});
		} else {
			// Handle single identifiers
			let regEx = /"([^"]*)"/g;
			let matches = processedValue.match(regEx);
			if (matches) {
				matches.forEach(match => {
					let snakeCaseMatch = this.toSnakeCase(match.replace(/"/g, ''));
					processedValue = processedValue.replace(match, `"${snakeCaseMatch}"`);
				});
			}
		}

		this.where += processedValue;
	}


	protected VisitParenExpression(node: Token, context: any) {
		this.where += "(";
		this.Visit(node.value, context);
		this.where += ")";
	}

	
	/*
	protected VisitLiteral(node:Token, context:any){
		if (this.options.useParameters){
			let name = `p${this.parameterSeed++}`;
			let value = Literal.convert(node.value, node.raw);
			context.literal = value;
			this.parameters.set(name, value);
			this.where += "?";
		}else this.where += (context.literal = SQLLiteral.convert(node.value, node.raw));
	}
	*/

	/*
	protected VisitEqualsExpression(node:Token, context:any){
		this.Visit(node.value.left, context);
		this.where += " = ";
		this.Visit(node.value.right, context);
		if (this.options.useParameters && context.literal == null){
			this.where = this.where.replace(/= \?$/, "IS NULL").replace(new RegExp(`\\? = \\[${context.identifier}\\]$`), `[${context.identifier}] IS NULL`);
		}else if (context.literal == "NULL"){
			this.where = this.where.replace(/= NULL$/, "IS NULL").replace(new RegExp(`NULL = \\[${context.identifier}\\]$`), `[${context.identifier}] IS NULL`);
		}
	}
	*/

}
