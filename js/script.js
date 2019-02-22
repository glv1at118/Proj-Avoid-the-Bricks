$(function(){


  /* Disable the mouse copy select behavior in the web page */
  document.documentElement.onselectstart = function(){
    return false;
  };


  /* Params: Game initial parameter settings*/
  var timerGen = 0; /* This is the timer num which stores the timerGen */
  var timerDropDownArr = []; /* This array stores all the timer drop down's number */
  var index = 0; /* Index for the timerDropDownArr */
  /* Player's block initial position params */
  var $playerBlock = $("#playerBlock");
  var playerX = 5; /* initial player's block x coordinate */
  var playerY = 13; /* initial player's block y coordinate */
  /* Game difficulty level -- Set the time interval for block dropping down */
  var levelEasy = 500;
  var levelMedium = 350;
  var levelHard = 200;
  var levelCrazy = 100;
  var level = levelEasy; /* Initial game difficulty is easy, slowest */
  /* flag controls that the user can only use the start to play button ONCE. Unless the page is refreshed */
  var flag = true;
  /* Set a timer to record how long you've survived */
  var timerSurvival; /* the setInterval timer ID for the survival timer */
  var tStartSeconds; /* the milliseconds when the game round starts */
  var tStopSeconds; /* the total time length the user played */
  var tCurrent; /* the every "current" milliseconds. Keeps changes as the setInterval goes... */
  /* Set the highest score for the 4 different levels */
  var highestScore1 = 0; /* level easy */
  var highestScore2 = 0; /* level medium */
  var highestScore3 = 0; /* level hard */
  var highestScore4 = 0; /* level crazy */

  /* Have to use 2 variables, levelIndicator and levelSet to shift and store the level num */
  var levelIndicator = 1; /* indicates the level the user played for the "previous" round */
  var levelSet = 1; /* it changes instantly when the user clicks the level select buttons */


  /* Player's block movement function declaration */
  function move(){
    $playerBlock[0].style.left = playerX * 50 + "px";
    $playerBlock[0].style.top = playerY * 50 + "px";
  }


  /* Game load function declaration -- Wraps the timer inside. Make it a function for better invoking */
  function loadGame(){
    /* Once the game starts to run and blocks dropping down, level selectors cannot be clicked */
    $("#easy").prop("disabled", true);
    $("#medium").prop("disabled", true);
    $("#hard").prop("disabled", true);
    $("#crazy").prop("disabled", true);

    /* Eveytime you load the game, regardless it's the first or non-first time, levelSet's value is to be given to levelIndicator, to make the current levelIndicator align with the current level. Because later I am going to use the levelIndicator and showHighest() method to display the score */
    levelIndicator = levelSet;

    /* Generate enemy block position index and move downward */
    timerGen = setInterval(function(){
      /* Each line, there will be 2 blocks generated */
      /* Generating 1st block */
      var genX1 = parseInt(Math.random()*11);
      var genY1 = 0;
      var genID_str1 = "#c" + genX1 + genY1;
      $(genID_str1).toggleClass("cellChanged");

      /* Generating 2nd block */
      do{
        var genX2 = parseInt(Math.random()*11);
      }while(genX2 === genX1);
      var genY2 = 0;
      var genID_str2 = "#c" + genX2 + genY2;
      $(genID_str2).toggleClass("cellChanged");

      /* Control the previously generated blocks to drop downward */
      var timerDropDown = setInterval(function(){
        /* Control 1st generated block to drop down */
        genY1++;
        $(genID_str1).toggleClass("cellChanged");
        genID_str1 = "#c" + genX1 + genY1;
        $(genID_str1).toggleClass("cellChanged");

        /* Control 2nd generated block to drop down */
        genY2++;
        $(genID_str2).toggleClass("cellChanged");
        genID_str2 = "#c" + genX2 + genY2;
        $(genID_str2).toggleClass("cellChanged");

        /* Clear the dropdown timer. Otherwise there will be so many dropdown timers running background */
        if(genY1 >= 14){
          clearInterval(timerDropDown);
        }
        if(genY2 >= 14){
          clearInterval(timerDropDown);
        }

      }, level);

      timerDropDownArr[index] = timerDropDown;
      index++;

    }, level);
  }


  /* Start game button callback function */
  $("#btn_start").on("click", function(){
    if(flag){
      flag = false; /* Ensures you can only click start button "ONCE" at the "VERY BEGINNING" */

      /* Player block control, keydown callback function, invoking the "move" function */
      $(document.documentElement).keydown(function(event){
        switch (event.keyCode) {
          case 37: // left
            if(playerX === 0){
              playerX = 0;
            } else{
              playerX--;
            }
            move();
            break;
          case 38: // up
            if(playerY === 0){
              playerY = 0;
            } else{
              playerY--;
            }
            move();
            break;
          case 39: // right
            if(playerX === 10){
              playerX = 10;
            } else{
              playerX++;
            }
            move();
            break;
          case 40: // down
            if(playerY === 13){
              playerY = 13;
            } else{
              playerY++;
            }
            move();
            break;
          default:
            break;
        }
      });

      /* Invoking the "loadGame" function */
      loadGame();

      /* Start the survival timer */
      timerStart();

      /* Notes: The if mechanism: If the gameOverCover appears, then start button won't work. If the timerDropDownArr is not empty, then it means blocks are still dropping down, then start button won't work. Say, at the very beginning, the gameOverCover is invisible, and timerDropDownArr is empty, you can start. But during the game, the timerDropDownArr is not empty, then start button won't work. If the game is over, then regardless the timerDropDownArr is empty or not, the gameOverCover is visible, then you cannot click start. This effectively prevents multiple timers running background which will trigger a glitch */
    }
  });


  /* A mechanism to judge if the player's block clashes with the generated block */
  setInterval(function(){
    var positionID = "#c" + playerX + playerY;
    if($(positionID).hasClass("cellChanged")){
      clearInterval(timerGen); /* Stop generating new blocks */
      $(".gameOverCover")[0].style.display = "block"; /* Display the gameOverCover */
      timerStop(); /* Stop the survival timer */

      /* Clear all the drop down timers inside the timerDropDownArr array, calling a halt to all the dark blocks dropping down */
      for(var i = 0; i < timerDropDownArr.length; i++){
        clearInterval(timerDropDownArr[i]);
      }
      /* Reset the timerDropDownArr and index and reload the game. Note resetting the timerDropDownArr and index is not necessary but it's good to do so. Otherwise the index will keep going up, and the timerDropDownArr's length will keep growing... */
      timerDropDownArr = [];
      index = 0;

      /* When the game is over, level selectors can be clicked */
      $("#easy").prop("disabled", false);
      $("#medium").prop("disabled", false);
      $("#hard").prop("disabled", false);
      $("#crazy").prop("disabled", false);

    }
  }, 10); /* make a judgement of whether clashed or not every 10ms. Make it short enough to be precise */


  /* Replay callback function */
  /* mousedown and mouseup are cousins. Mousedown always happens first and mouseup always happens second */
  $("#replay").mousedown(function(){
    $("#replay img").attr("src", "img/replay1.png");

    /* When replay is clicked, first it's going to display the highest score, the later as you reload and restart the game, levelSet is going to be given to levelIndicator. But currently at this time point, this is still the previous levelIndicator, which aligns with the last round level you played. This line of code, and the "levelIndicator=levelSet" line above, helps correctly display the score. Also you see the necessity to have 2 variables, levelIndicator and levelSet */
    showHighest();

  }).mouseup(function(){
    $("#replay img").attr("src", "img/replay2.png");
    $(".gameOverCover")[0].style.display = "none";

    /* Reset the position of the player block */
    $playerBlock[0].style.left = 250 + "px";
    $playerBlock[0].style.top = 650 + "px";
    playerX = 5;
    playerY = 13;

    /* Change the color of the drop down blocks back to original */
    $(".cell").each(function(){
      if($(this).hasClass("cellChanged")){
        $(this).toggleClass("cellChanged");
      }
    });

    /* Reload the game */
    loadGame();

    /* Reset the survival timer and start the survival timer again */
    timerReset();
    timerStart();

    /* Once the game starts to re-run, level selectors cannot be clicked */
    $("#easy").prop("disabled", true);
    $("#medium").prop("disabled", true);
    $("#hard").prop("disabled", true);
    $("#crazy").prop("disabled", true);

  });


  /* Survival timer start */
  function timerStart(){
    tStartSeconds = Date.now();
    timerSurvival = setInterval(function(){
      tCurrent = Date.now();
      tStopSeconds = parseInt((tCurrent - tStartSeconds)/1000);
      $("#survival").html(tStopSeconds);
    }, 50);
  }

  /* Survival timer stop */
  function timerStop(){
    clearInterval(timerSurvival);
  }

  /* Survival timer reset to 0 */
  function timerReset(){
    $("#survival").html(0);
  }


  /* Display the highest historical score */
  function showHighest(){
    if(levelIndicator === 1){
      if(highestScore1 < tStopSeconds){
        highestScore1 = tStopSeconds;
        $("#highest1").html(highestScore1);
      }
    } else if(levelIndicator === 2){
      if(highestScore2 < tStopSeconds){
        highestScore2 = tStopSeconds;
        $("#highest2").html(highestScore2);
      }
    } else if(levelIndicator === 3){
      if(highestScore3 < tStopSeconds){
        highestScore3 = tStopSeconds;
        $("#highest3").html(highestScore3);
      }
    } else if(levelIndicator === 4){
      if(highestScore4 < tStopSeconds){
        highestScore4 = tStopSeconds;
        $("#highest4").html(highestScore4);
      }
    }
  }


  /* Adjusting the game difficulty - easy, medium, hard, crazy - Callback function */
  $("#easy").click(function(){
    if(timerDropDownArr.length === 0){
      $("#easy").prop("disabled", false);
      level = levelEasy; /* Change the block drop speed */
      levelSet = 1;
      /* levelSet will change instantly when clicked. However, levelIndicator will not */
    }
  });
  $("#medium").click(function(){
    if(timerDropDownArr.length === 0){
      level = levelMedium; /* Change the block drop speed */
      levelSet = 2;
    }
  });
  $("#hard").click(function(){
    if(timerDropDownArr.length === 0){
      level = levelHard; /* Change the block drop speed */
      levelSet = 3;
    }
  });
  $("#crazy").click(function(){
    if(timerDropDownArr.length === 0){
      level = levelCrazy; /* Change the block drop speed */
      levelSet = 4;
    }
  });


  /* Setting the user interface themes, click callback function */
  $("#sand").click(function(){
    removeThemes();
    $(".leftPanel").css("color", "black");
  });
  $("#forest").click(function(){
    removeThemes();
    $(".leftPanel, .rightPanel").addClass("forestGreen");
    $(".cell").addClass("cellForest");
    $(".leftPanel").css("color", "black");
  });
  $("#ocean").click(function(){
    removeThemes();
    $(".leftPanel, .rightPanel").addClass("oceanBlue");
    $(".cell").addClass("cellOcean");
    $(".leftPanel").css("color", "black");
  });
  $("#classic").click(function(){
    removeThemes();
    $(".leftPanel, .rightPanel").addClass("classicBlack");
    $(".cell").addClass("cellClassic");
    $(".leftPanel").css("color", "white");
  });

  /* A standalone function to help remove themes all at once (remove the theme classes) */
  function removeThemes(){
    $(".leftPanel, .rightPanel").removeClass("forestGreen");
    $(".leftPanel, .rightPanel").removeClass("oceanBlue");
    $(".leftPanel, .rightPanel").removeClass("classicBlack");
    $(".cell").removeClass("cellForest");
    $(".cell").removeClass("cellOcean");
    $(".cell").removeClass("cellClassic");
  }

});
