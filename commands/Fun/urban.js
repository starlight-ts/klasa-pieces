const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches the Urban Dictionary library for a definition to the search term.',
			usage: '<search:str> [resultNum:int]',
			usageDelim: ', '
		});

		this.pieces = {
			type: 'commands',
			requiredModules: ['snekfetch']
		};
	}

	async run(msg, [search, index = 1]) {
		const body = await snekfetch.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(search)}`)
			.then(data => JSON.parse(data.text));

		const definition = this.getDefinition(search, body, --index);
		return msg.send(search, definition, index);
	}

	getDefinition(search, body, index) {
		const result = body.list[index];
		if (!result) throw 'No entry found.';

		const wdef = result.definition.length > 1000 ?
			`${this.splitText(result.definition, 1000)}...` :
			result.definition;

		return [
			`**Word:** ${search}`,
			`\n**Definition:** ${++index} out of ${body.list.length}\n_${wdef}_`,
			`\n**Example:**\n${result.example}`,
			`<${result.permalink}>`
		].join('\n');
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}

};
