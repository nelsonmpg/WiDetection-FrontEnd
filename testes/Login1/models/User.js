var mongoose=require('mongoose');
var bcrypt=require('bcrypt');

/*
 * Cria��o do schema, que � a estrutura da nosso documento.
 * S� lembrando que como o Mongo � um banco no-SQL, n�o existe o conceito de tabela e sim
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
 * M�todos pertencentes ao schema.
 */
// encripta a senha
schema.methods.generateHash=function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

// Checa se a senha informada � igual a senha do banco
schema.methods.checkPassword=function(password){
	return bcrypt.compareSync(password, this.auth.local.password);
};

// Cria o modelo, o que equivale a cria��o do documento no banco.
var User=mongoose.model('User', schema);

module.exports=User;
