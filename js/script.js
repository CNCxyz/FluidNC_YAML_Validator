$(document).ready(function() {
	
	var schema = null;
	
	$.getJSON("https://gist.githubusercontent.com/ajquick/d6d3b67b5b8aede986e500d3be40b5ee/raw/245c299196481e1fbcace29b0c1b0f8410143477/FluidNC_Schema.json", function(json) {
		var replaceSchema = JSON.stringify(json).split('\\\\').join('\\\\');
		schema = JSON.parse(replaceSchema);
	});

 $("#form").on("submit", function(e){
	e.preventDefault();
	data = $("#yaml").val();
	isValid(schema, data);	
    return false;
 })
 
 $("textarea").on("input", function(){
	$('#success').hide();
	$('#check').prop("disabled", false);
	$('#error').hide();
 });
 
});

function isValid(schema, data) {
		
	const resolvePath = (object, path, defaultValue) => path.split(/[\.\[\]\'\"]/).filter(p => p).reduce((o, p) => o ? o[p] : defaultValue, object);
		
	const ajv = new ajv7.default({allErrors: true, strict: true});

	var yamlerror = null;

	try {
		data = jsyaml.load(data);
	} catch (err) {
		$('#error').show();
		yamlerror = err.message;
		$('#error_text').text(yamlerror);
	}

	if (yamlerror == null) {

		const valid = ajv.validate(schema, data);
	
		if (ajv.errors) {
			console.log(ajv.errors);
			
			var text = "";
			
			for(let i = 0; i < ajv.errors.length; i++) {
				var dataPath = ajv.errors[i]['instancePath'].replace(/\//g,".");
				readablePath = dataPath.replace(/\./g,":\n").slice(2);
				readablePath = readablePath.split("\n");
				readablePath2 = "";
				for(let j = 0; j < readablePath.length; j++){
					readablePath2 += "\n" + (" ").repeat((j+1) * 2) + readablePath[j];
				}
				readablePath = readablePath2;
				readablePath = readablePath.slice(3);
				readableMessage = ajv.errors[i]['message'].charAt(0).toUpperCase() + ajv.errors[i]['message'].slice(1);
				if(text.length != 0){
					text += "\n\n=================================\n\n";	
				}
				text += readablePath + ": " + resolvePath(data, dataPath) + "\n\n" + readableMessage;
			}
			$('#error_text').text(text);
			$('#error').show();

		} else {
			$('#error').hide();
			$('#error_text').text();
			$('#check').prop("disabled", "disabled");
			$('#success').show();
		}
		
	}

}