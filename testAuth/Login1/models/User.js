var mongoose=require('mongoose');
var bcrypt=require('bcrypt');

/*
 * Criação do schema, que é a estrutura da nosso documento.
 * Só lembrando que como o Mongo é um banco no-SQL, não existe o conceito de tabela e sim
 * de documento. 
 */
var schema=mongoose.Schema({
	auth:{
		local:{
			email:String,
    		password:String,
		},
    	twitter:{
			id:String,
			token:String,
			displayName:String,
			username:String,
		},
		google:{
			id:String,
			token:String,
			email:String,
			name:String,
		},
		facebook:{
			id:String,
			token:String,
			email:String,
			name:String,
		},
	},
});

/*
 * Métodos pertencentes ao schema.
 */
// encripta a senha
schema.methods.generateHash=function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

// Checa se a senha informada é igual a senha do banco
schema.methods.checkPassword=function(password){
	return bcrypt.compareSync(password, this.auth.local.password);
};

// Cria o modelo, o que equivale a criação do documento no banco.
var User=mongoose.model('User', schema);

module.exports=User;
