define([	
	'underscore'
, 'cardProperties'
,	'card'
,	'../../collections/hand'
,	'../../collections/deck'
,	'../../game'
, 'gameError'
], 
  function(_, CardProperties, Card, Hand, Deck, Game, GameError) {
  	describe("Game", function(){
  		it("should be initialised with a deck", function(){
  			var game = new Game();
  			expect(game.deck).toBeDefined();
  		});

  		it("should know what turn of the game it is", function(){
  			var game = new Game();
        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
  			expect(game.turn).toEqual(0);
  			
  			game.playNextTurn();
  			expect(game.turn).toEqual(1);

  			game.playNextTurn();
  			expect(game.turn).toEqual(2);
  		});

  		it("should be initialised with 4 players", function(){
  			var game = new Game();

  			expect(game.players.length).toEqual(4);
  			expect(game.players[0].name).toEqual("Player 1");
  			expect(game.players[1].name).toEqual("Computer 1");
  			expect(game.players[2].name).toEqual("Computer 2");
  			expect(game.players[3].name).toEqual("Computer 3");
  		});

  		it("should assign a hand to each player from its deck", function(){
  			var game = new Game();

  			expect(game.players[0].hand).toBeDefined();
  			expect(game.players[0].hand.models.length).toEqual(13);

  		});

      it("should throw an exception if we try and advance to turn 1 before each player has performed their swap phase", function(){
        var game = new Game(),
            expectedException = new GameError("all players must complete their swap phase");

        expect(function() { game.playNextTurn(); }).toThrow(expectedException);
        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });

        game.playNextTurn();
        expect(game.turn).toEqual(1);
      });

      it("should accept the two of clubs as the first card played in turn 1", function(){
        var game = new Game()
        ,   twoOfClubs;

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 1;

        twoOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.two });
        game.processPlayersGo(game.players[0], twoOfClubs);
      });

      it("should throw an exception if any other card apart from the two of clubs is the first card played", function(){
        var game = new Game(),
        deck = new Deck(),
        otherCards,
        expectedException = new GameError("first card played must be two of clubs");

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 1;

        otherCards = _.filter(deck.models, 
          function(card){ 
            return !(card.get('suit') === CardProperties.suit.clubs && card.get('rank') === CardProperties.rank.two)
          });

        expect(otherCards.length).toEqual(51);

        _.each(otherCards, function(card){
          expect(function() { game.processPlayersGo(game.players[0], card); }).toThrow(expectedException);
        });

      });

      it("should record the turn, player and card for every go", function(){
        var game = new Game()
        ,   twoOfClubs
        ,   kingOfClubs
        ,   queenOfClubs
        ,   aceOfClubs;

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 1;

        twoOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.two });
        kingOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.king });
        queenOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.queen });
        aceOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.ace });

        game.processPlayersGo(game.players[0], twoOfClubs);
        game.processPlayersGo(game.players[1], kingOfClubs);
        game.processPlayersGo(game.players[2], queenOfClubs);
        game.processPlayersGo(game.players[3], aceOfClubs);

        expect(game.record).toEqual([
          [1, game.players[0], twoOfClubs],
          [1, game.players[1], kingOfClubs],
          [1, game.players[2], queenOfClubs],
          [1, game.players[3], aceOfClubs]
          ]);
      });

      it("a player wins a turn if he places a card of the highest rank of the same suit as the start card", function(){
        var game = new Game()
        ,   twoOfClubs
        ,   kingOfClubs
        ,   queenOfClubs
        ,   aceOfClubs;

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 1;

        twoOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.two });
        kingOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.king });
        queenOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.queen });
        aceOfClubs = new Card({suit: CardProperties.suit.clubs, rank: CardProperties.rank.ace });

        game.processPlayersGo(game.players[0], twoOfClubs);
        game.processPlayersGo(game.players[1], aceOfClubs);
        game.processPlayersGo(game.players[2], queenOfClubs);
        game.processPlayersGo(game.players[3], kingOfClubs);

        expect(game.players[3].winnerOfLastRound).toBe(false);
        expect(game.players[0].winnerOfLastRound).toBe(false);
        expect(game.players[1].winnerOfLastRound).toBe(true);
        expect(game.players[2].winnerOfLastRound).toBe(false);
      });
      it("should add to the winning players score the total points during the turn", function(){
        var game = new Game()
        ,   fiveOfHearts
        ,   queenOfSpades
        ,   twoOfDiamonds
        ,   fourOfHearts;

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 2;

        fiveOfHearts = new Card({suit: CardProperties.suit.hearts, rank: CardProperties.rank.five });
        queenOfSpades = new Card({suit: CardProperties.suit.spades, rank: CardProperties.rank.queen });
        twoOfDiamonds = new Card({suit: CardProperties.suit.diamonds, rank: CardProperties.rank.two });
        fourOfHearts = new Card({suit: CardProperties.suit.hearts, rank: CardProperties.rank.four });

        game.processPlayersGo(game.players[0], fiveOfHearts);
        game.processPlayersGo(game.players[1], queenOfSpades);
        game.processPlayersGo(game.players[2], twoOfDiamonds);
        game.processPlayersGo(game.players[3], fourOfHearts);
        
        expect(game.players[0].score).toEqual(15);
        expect(game.players[1].score).toEqual(0);
        expect(game.players[2].score).toEqual(0);
        expect(game.players[3].score).toEqual(0);
      });

      it("a player who gets all 26 points in one game shoots the moon", function(){
        var game = new Game()
        ,   fiveOfHearts
        ,   queenOfSpades
        ,   twoOfDiamonds
        ,   fourOfHearts;

        _.each(game.players, function(player){ player.swapPhaseCompleted = true; });
        game.turn = 2;
        game.players[0].score = 11;

        fiveOfHearts = new Card({suit: CardProperties.suit.hearts, rank: CardProperties.rank.five });
        queenOfSpades = new Card({suit: CardProperties.suit.spades, rank: CardProperties.rank.queen });
        twoOfDiamonds = new Card({suit: CardProperties.suit.diamonds, rank: CardProperties.rank.two });
        fourOfHearts = new Card({suit: CardProperties.suit.hearts, rank: CardProperties.rank.four });

        game.processPlayersGo(game.players[0], fiveOfHearts);
        game.processPlayersGo(game.players[1], queenOfSpades);
        game.processPlayersGo(game.players[2], twoOfDiamonds);
        game.processPlayersGo(game.players[3], fourOfHearts);
        
        expect(game.players[0].score).toEqual(0);
        expect(game.players[1].score).toEqual(26);
        expect(game.players[2].score).toEqual(26);
        expect(game.players[3].score).toEqual(26);
      });

      it("should number players from 1 to 4", function(){
        var game = new Game();

        expect(game.players[0].number).toEqual(1);
        expect(game.players[1].number).toEqual(2);
        expect(game.players[2].number).toEqual(3);
        expect(game.players[3].number).toEqual(4);
      })
  	})
  }
)

