const App = {
	screenWidth: 0,
	screenMargin: 25,
	urlNext: "https://pokeapi.co/api/v2/pokemon",
	urlPrev: null,
	pokemonList: [],
	pokemonOnStage: null,
	pokemonOnStageIndex: null,
	pokemonCathced: [],
	getRandom: () =>{
		return Math.round( Math.random() );
	},
	getPokemonList: ( nextOrPrev ) => {
		const url = nextOrPrev == "next" ? App.urlNext : App.urlPrev;
		if(url != null){
			$.ajax({
				url: url, 
				success: function(result){
					App.urlNext = result.next;
					App.urlPrev = result.previous;
				 	App.pokemonList = result.results;
				 	App.renderLeftSide();
				}
			});

		}
	},
	getPokemonDetails: (pokemon, index) => {
		$.ajax({
			url: pokemon.url, 
			success: function(result){
				App.pokemonList[index].details = result;
				$("img[name='image-left-"+index+"']").prop( "src" , App.pokemonList[index].details.sprites.front_default );
			}
		});
	},
	clearMainGround: () => {
		App.pokemonOnStage = null;
		App.pokemonOnStageIndex = null;
		$("#btnCatch").hide();
	 	$("#btnRelease").hide();

		$("#selected-image").prop("src", "");
		$("#selected-name").text( "" );
		$("#selected-moves > tbody").html("");
		$(".types-container").html( "" );
		$("#lblDesc").text("");
	},
	bindingEvent: () => {
		$(".pokemon-card").click( function(){
			App.clearMainGround();
	 		
	 		let index = $(this).data("idx");
	 		let side = $(this).data("side");

	 		App.pokemonOnStageIndex = index;

	 		if( side == "left" ){
	 			App.pokemonOnStage = App.pokemonList[index];
	 			$("#selected-name").text( App.pokemonOnStage.name );
	 			$("#btnCatch").show();
	 		}
	 		else{
	 			App.pokemonOnStage = App.pokemonCathced[index];
	 			$("#selected-name").text( App.pokemonOnStage.nameFromMe + " (" + App.pokemonOnStage.name + ")" );
	 			$("#btnRelease").show();
	 		}
	 		
	 		$("#selected-image").prop("src", App.pokemonOnStage.details.sprites.front_default );
	 		
	 		if( App.pokemonOnStage.nameFromMe != undefined ){
	 			
	 		}
	 		else{
	 			
	 		}

	 		let moves = '';
	 		App.pokemonOnStage.details.moves.forEach( (row, index) => {
	 			moves += 	`<tr>
	 							<td>`+ (index+1) +`</td>
	 							<td>`+ row.move.name +`</td>
	 						</tr>`
	 		});

	 		$("#selected-moves > tbody").html(moves);

	 		let types = '';
	 		App.pokemonOnStage.details.types.forEach( (row, index) => {
	 			types += '<div>'+ row.type.name +'</div>';
	 		});

	 		$(".types-container").html( types );
	 	});
	},
	renderLeftSide: () => {
		let newList = '';

	 	App.pokemonList.forEach( (row, index) => {
	 		App.getPokemonDetails(row, index);

	 		const countCatched = App.pokemonCathced.filter((poke) => {
	 			if(poke.name == row.name){
	 				return poke;
	 			}
	 		}).length;

	 		let counter = ''
	 		if( countCatched > 0 ){
	 			counter = '<div class="counter">'+countCatched+'</div>';

	 		}

	 		newList += `<div class="pokemon-card" data-idx="`+index+`" data-side="left">
	 						`+counter+`
	 						<img name="image-left-`+index+`" src="">
	 						<div class="name">`+row.name+`</div>
	 					</div>`
	 	});

	 	$("#left-pokemon-list").html(newList);
			App.bindingEvent();
	},
	renderRightSide: () => {
		let newList = '';
		App.pokemonCathced.forEach( (row, index) => {
	 		newList += `<div class="pokemon-card" data-idx="`+index+`" data-side="right">
	 						<img name="image-right-`+index+`" src="`+row.details.sprites.front_default+`">
	 						<div class="name">`+ row.nameFromMe +`</div>
	 					</div>`
	 	});
	 	$("#right-pokemon-list").html(newList);
	 	App.bindingEvent();
	},
	init: () => {
		let getLastSession = JSON.parse( window.localStorage.getItem('pokemon') );
		if ( Array.isArray( getLastSession )  ){
			App.pokemonCathced = getLastSession;
			App.renderRightSide();
		}

		App.getPokemonList( "next" );
		$("button.btn-expand").click( (e) => {
			const side = $(e.target).data("target");
			const oppositeSide = side == "left" ? "right" : "left";
			const isHide = $("div."+ side +"-side").hasClass("hide");
			if( isHide ){
				$("body").css("margin-"+side , App.screenMargin+"vw");
				$("div."+ side +"-side").removeClass("hide");

				$("div."+ oppositeSide +"-side").addClass("hide");
				$("body").css("margin-"+oppositeSide ,"0");
			}
			else{
				$("body").css("margin-"+side , "0");
				$("div."+ side +"-side").addClass("hide");
			}
		});
		$("#btn-prev-left, #btn-next-left").click(function(){
			let idBtn = $(this).prop("id");
			let direction = idBtn == "btn-next-left" ? "next" : "prev";
			App.getPokemonList( direction );
		});
		$("#btnCatch").click( () => {
			$("#selected-image").addClass("catch");
			$("#lblDesc").text("cathcing..");
			setTimeout(function(){
				$("#selected-image").removeClass("catch");
			},2000);

			setTimeout( () =>{
				const catchResult = App.getRandom();
				if( catchResult == 1 ){
					$("#lblDesc").text("yeah, cathced!");
					$("#modalName").modal({backdrop: 'static', keyboard: false});
					setTimeout(() =>{
						$("#modalName-txtName").focus();
					},500);
				}
				else{
					$("#lblDesc").text("ouh, you failed!");
				}
			}, 3000);

		});

		$("#btnRelease").click( () => {
			$("#selected-image").addClass("catch");
			$("#lblDesc").text("releasing..");
			setTimeout(function(){
				$("#selected-image").removeClass("catch");
			},2000);

			setTimeout( () =>{
				$("#lblDesc").text("The pokemon has been released!");
			}, 3000);

			App.pokemonCathced.splice( App.pokemonOnStageIndex , 1 );
			window.localStorage.setItem('pokemon', JSON.stringify( App.pokemonCathced ) );


			setTimeout( () =>{
				App.clearMainGround();
				App.renderLeftSide();
				App.renderRightSide();

			}, 5000);
		});


		$("#modalName-btnSave").click( () => {
			let name = $("#modalName-txtName").val();
			if( name == "" ){
				return;
			}

			let newPokemon = { ...App.pokemonOnStage};
				newPokemon.nameFromMe = $("#modalName-txtName").val();
			App.pokemonCathced.push( newPokemon );
			window.localStorage.setItem('pokemon', JSON.stringify( App.pokemonCathced ) );

			$("#modalName").modal("hide");
			$("#modalName-txtName").val("");
			App.clearMainGround();
			App.renderLeftSide();
			App.renderRightSide();


			$("body").css("margin-left" ,"0");
			$("div.left-side").addClass("hide");
			$("body").css("margin-right" , App.screenMargin+"vw");
			$("div.right-side").removeClass("hide");
		});

		

		App.screenWidth = screen.width;
		if( App.screenWidth > 1200){
			App.screenMargin = 8;
		}
		else if( App.screenWidth > 992){
			App.screenMargin = 10;
		}
		else if(App.screenWidth > 600){
			App.screenMargin = 14;
		}
	}
}

$(document).ready(function(){
	App.init();
});