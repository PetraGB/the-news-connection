


var titleDiv;
var contentDiv;
var linkContainer;
var linkTemplate;
var historyTemplate;

var currentArticle;

var his = [];
var currentHisItem = -1;

var historyMode = 0;

var toggleImage0 = "icons/toggle_graph.png";
var toggleImage1 = "icons/toggle_list.png";
var ca;

var linkFilter = "";



function init() {

    var toggle = getUrlParameter("toggleHistoryMode");
    if(toggle !== undefined) {
        var mode = localStorage.getItem('historyMode');
        if(mode === null || mode == 0) {
            historyMode = 1;
        } else {
            historyMode = 0;
        }
        localStorage.setItem('historyMode', historyMode);
    } else {
        historyMode = localStorage.getItem('historyMode');
        if(historyMode === null) historyMode = 0;
    }

    var f = getUrlParameter("filter");
    if(f !== undefined) {
        linkFilter = f;
    }


    var image = historyMode == 0 ? toggleImage0 : toggleImage1;
    $("#toggleHistoryButton").css('background-image', 'url(' + image + ')');

    titleDiv = $("#title");
    contentDiv = $("#content");
    linkContainer = $("#linkContainer");
    linkTemplate = linkContainer.find("a");

    historyTemplate = $("#historyList2").find("a");

    ca = getUrlParameter("article");
    if(ca === undefined) ca = "article1";

    currentArticle = eval(ca);

    $("#toggleHistoryLink").attr('href', "index.html?article=" + ca + "&toggleHistoryMode=1");

    loadHistory();
    loadArticle(currentArticle);

    if(historyMode == 0) {
      for(var i = 0; i < his.length; i++) {
        if(i != currentHisItem) {
          addToHistory(eval(his[i]));
        } else {
          addToHistoryCurrent(eval(his[i]));
        }
      }
    }

    historyTemplate.remove();


    initCanvas();

    if(f !== undefined) {
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    }
}

function loadHistory() {
  var item = localStorage.getItem('history1');
  if(item == "" || item == null) item = "[]";
  his = JSON.parse(item);
}

function saveHistory() {
  localStorage.setItem('history1', JSON.stringify(his));
}

function clearHistory() {
  localStorage.setItem('history1', "[]");
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
 //FROM http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function findInHistory(target) {
  for(var i = 0; i < his.length; i++) {
    if(his[i] == target) {
      return i;
    }
  }

  return -1;
}

function loadArticle(article) {
  var inHisIndex = findInHistory(article.target);
  if(inHisIndex == -1) {
    his.push(article.target);
    currentHisItem = his.length - 1;
    saveHistory();
  } else {
    currentHisItem = inHisIndex;
  }


  titleDiv.html(article.title);
  contentDiv.html(article.content);

  var links = article.links;
  var filteredLinks = [];

  var maxLinks = 3;
  if(linkFilter != "") {
      maxLinks = 10;
  }

  if(linkFilter == "" || linkFilter == "all") {
      filteredLinks = links;
  }

  if(linkFilter == "read") {
      for(var i = 0; i < article.links.length; i++) {
          if(findInHistory(links[i].target) != -1) {
              filteredLinks.push(links[i]);
          }
      }
  } else if(linkFilter == "unread") {
      for(var i = 0; i < article.links.length; i++) {
          if(findInHistory(links[i].target) == -1) {
              filteredLinks.push(links[i]);
          }
      }
  } else if(linkFilter.endsWith(".png")) {
      for(var i = 0; i < article.links.length; i++) {
          if(links[i].icon.endsWith(linkFilter)) {
              filteredLinks.push(links[i]);
          }
      }
  }

  links = filteredLinks;

  var notReadList = []
  for(var i = links.length - 1; i >= 0; i--) {
    if(findInHistory(links[i].target) == -1) {
      notReadList.push(links[i]);
      links.splice(i, 1);
    }
  }

  notReadList.reverse();

  var remaining = maxLinks - notReadList.length
  for(var i = 0; i < remaining; i++) {
    if(links.length > i) {
      notReadList.push(links[i]);
    }
  }

  currentList = notReadList;

  for(var i = 0; i < Math.min(currentList.length, maxLinks); i++) {
    var link = linkTemplate.clone();
    var target = currentList[i].target;
    var linked_article = eval(target);

    if(findInHistory(target) != -1) {
      link.find(".linkbox").addClass("linkbox_visited");
    }

    link.attr('href', "index.html?article=" + target);
    link.find(".linkbox_title").text(onlyText(linked_article.title));
    link.find(".linkbox_description").text(currentList[i].description);
    link.find(".linkbox_icon").css('background-image', 'url(' + currentList[i].icon + ')');

    linkContainer.append(link);
  }
  linkTemplate.remove();

  $("#filterLinks > a").each(function() {
     var item = $(this);
     item.attr('href', "index.html?article=" + ca + "&filter=" + item.attr('id'));
  });
}

function onlyText(str) {
  var text = $(str).text();
  if(text == "") text = str;

  return text;
}

function addToHistory(article) {
  var item = historyTemplate.clone();
  var text = onlyText(article.title);
  item.find(".historybox_title").text(text);
  item.attr('href', "index.html?article=" + article.target);
  $('#historyList2').append(item);

  //var link = '<li><a href="index.html?article={0}">{1}</a></li>'.format(article.target, text);
  //$('#historyList').append(link);
}
function addToHistoryCurrent(article) {
  var item = historyTemplate.clone();
  var text = onlyText(article.title);
  item.find(".historybox").addClass("historybox_visited");
  item.find(".historybox_title").text(text);
  item.attr('href', "index.html?article=" + article.target);
  $('#historyList2').append(item);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};


//$( document ).ready( init );

var ballPositions = [];
var initialYOffset = 50;
var ballSize = 20;

var WIDTH = 300;
var HEIGHT = 800;

var tooltipWidth = 200;
var tooltipHeight = 85;

var ballMarginX = WIDTH * 0.2;

function setup() {
  randomSeed(0);
  init();
}

function draw() {
  if(historyMode == "0") return;

  background(color('#A9C0D8'));

  cursor(ARROW);


  for(var i = 0; i < his.length; i++) {
    //var posX = random(ballSize, width - ballSize);
    //var posY = initialYOffset + i * random(50, 80);

    //ballPositions.push(createVector(posX, posY));
    var pos = ballPositions[i];
    var posX = pos.x;
    var posY = pos.y;

    if(i > 0) {
      var lastBall = ballPositions[i - 1];
      line(posX, posY, lastBall.x, lastBall.y);
      stroke(0);
    }

    var d = dist(mouseX, mouseY, posX, posY);
    if(d < ballSize) {
      var article = eval(his[i]);
      var title = onlyText(article.title);

      stroke(color('#7880B5'));
      fill(color('#7880B5'));
      ellipse(posX, posY, ballSize * 1.5);
      cursor(HAND);
      if(mouseIsPressed) {
        window.location = "index.html?article=" + his[i];
      }

      for(var j = 0; j < article.links.length; j++) {
        var link = article.links[j];
        var index = findInHistory(link.target);

        if(index != -1) {
          if(index > 0 && link.target == his[i - 1]) continue;
          var linkPos = ballPositions[index];
          stroke(color('#BE95C4'));
          strokeWeight(2.5);
          line(posX, posY, linkPos.x, linkPos.y);
        }
      }
    } else {
      strokeWeight(1);
      stroke(color('#7880B5'));
      fill(color('#7880B5'));
      ellipse(posX, posY, ballSize);
    }
  }

  for(var i = 0; i < his.length; i++) {
    var pos = ballPositions[i];
    var d = dist(mouseX, mouseY, pos.x, pos.y);
    if(d < ballSize) {
      stroke(color('#DCD7F4'));
      fill(colorAlpha('#DCD7F4', 0.5));

      var tooltipX = pos.x - tooltipWidth / 2;
      var tooltipY = pos.y + ballSize / 2;
      rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
      stroke(0);
      fill(0);
      textSize(14);
      textStyle(ITALIC);
      textFont("Verdana");
      text(title, tooltipX + 10, tooltipY + 10, tooltipWidth - 10, tooltipHeight - 10);

    }
  }

}

function colorAlpha(aColor, alpha) {
  var c = color(aColor);
  return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}

function initCanvas() {



  var lastY = 0;
  for(var i = 0; i < his.length; i++) {
    var posX = random(ballMarginX, 300 - ballMarginX);
    var posY = initialYOffset + i * 50;
    lastY = posY;
    ballPositions.push(createVector(posX, posY));
  }

 if(historyMode == "1") {
    var canvas = createCanvas(300, lastY + ballSize * 5);
    canvas.parent("history");
    background(0);
  }

}
