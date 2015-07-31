module.exports=function(app){
	var routes=require('../config/routes');
	var fs=require('fs');

	var controllers_folder=__dirname+'/../controllers';
	var policies_folder=__dirname+'/../config/policies';

	for(var k in routes){
		var route=routes[k];

		//separando a chave por espa�os, para pegar o m�todo 
		var url="";
		var method="";
		
		var k_array=k.split(/\s+/);
		if(k_array.length==1){
			url=k_array[0];
			method="get";
		}else if(k_array.length==2){
			method=k_array[0].toLowerCase();
			url=k_array[1];
		}else{
			throw new Error("Rota "+k+" -> "+route+" n�o est� seguindo o padr�o");
		}


		var controller_filename=route.controller;
		var action_name=route.action;
		var policy_name=route.policy;

		// caso a policy n�o tenha 
		var policy=undefined;
		if(!policy_name){
			console.log("[WARNING] Policy n�o declarada para esta rota. Utilizando a policy padr�o (sem restri��es).");
			policy=function(req,res,next){ return next() };
		}else{
			try{
				policy=require(policies_folder+'/'+policy_name+'.js');
			}catch(err){
				throw new Error("Arquivo n�o encontrado: "+policy_name);
			}
		}

		// carregando a rota
		var controller=require(controllers_folder+"/"+controller_filename+".js");
		app[method](url, policy, controller[action_name]);
	}
};
