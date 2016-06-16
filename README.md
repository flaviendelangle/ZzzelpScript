# ZzzelpScript

This document describes the main functionnalites of ZzzelpScript.
This extension aims at improving the confort of the online game [Antzzz](http://antzzz.org).

i.e : For now, ***Zzzelp*** and ***ZzzelpScript*** are only available in french. An english version is currently being developped.


-------------------

Installation
-------------------

***ZzzelpScript*** is available on *Chrome* and *Firefox* through a userscript. To install it, you need to install *GreaseMonkey* for *Firefox* or *TamperMonkey* for *Chrome*. Then you have to go on [this page](http://zzzelp.fr/Userscripts/zzzelpscript.user.js) to get the script.

If you are using *Chrome*, you can also install the [Extension](https://chrome.google.com/webstore/detail/zzzelpscript/kmhifjihihhjppngfjocphcicajknmkj?hl=fr).

If you want to manually add ***ZzzelpScript*** to an Antzzz page, you just have to add the following code in the head of the page :

~~~~html
<script src="http://zzzelp.fr/Userscripts/zzzelpscript.js">
~~~~

You can find more details about the installation [here](http://zzzelp.fr/script) (Zzzelp account needed).


-------------------

Alliance management
-------------------
One of the main goal of ***Zzzelp*** and ***ZzzelpScript*** is to give access to the leading team of any alliance to powerfull tools that will make their life easier and their alliance much more powerful.

#### 1. Rank display

***Antzzz*** allow the leaders of an alliance to put rank on each user. However these ranks are public which can be problematic when they have to contain private informations. With ***Zzzelp***, you can create complex rank rules to modify the ranks of the game or to create new ones. These ranks can also be linked to a color which can be very usefull to make a large amount of data readable.


#### 2. Data synchronisation

One of the key of success for the alliance is a good transmission of information. Unfortunately, it can sometimes be difficult to keep an up-to-date state of your members data. To help the managers, ***ZzzelpScript*** provide tools to easily synchronize the wanted data with ***Zzzelp***. Naturally, no data are sent to ***Zzzelp*** without the explicit agreement of the user.

Here are the data that can currently be synchronised with ***Zzzelp*** :
* your construction levels
* your research levels
* your number of workers
* your army
* your fights


-------------------

Interface improvement
-------------------

#### 1. Army page

***ZzzelpScript*** add a large amount of statistics about your army on the dedicated page. These statistics aim at helping the users understanding the current state of their troups.
To that end, ***ZzzelpScript*** display the following informations about the army in each location (Field, Dome and Nest) :
* life
* attack
* defense
* daily food consumption
* laying years
* capacity

#### 2. Alliance members page

The main feature added by ***ZzzelpScript*** on this page is of course the private ranks.

But it also display statistics about the alliance. 

Finally, it allow the user to hide part of the member to keep a clean list of members without all the inert players.

#### 3. Member profile

On this page, ***Zzzelpscript*** improve the viewing of colonies by removing theme from the top of the page and by putting theme below with more informations.

Furthermore, it adds an instance of ***ZzzelpFlood*** (see below) to launch optimized attacks directly from the profile.

#### 4. Ennemy page

On this page, ***ZzzelpScript*** add the time it would take to go to every target

-------------------

Social features
-------------------

#### 1. Smileys

On Antzzz, you can only use a limited amount of smileys. But thanks to ***ZzzelpScript***, it is now possible to create your own pack of smileys. You will also be able to share it with your friend or to the entire community. To do so, you have to create a ***Zzzelp*** account and to go on the *Gérer les smileys* page of the *Mon compte* menu.
These smileys are added on every field where ***Antzzz*** allow the use of smileys (private messages, chat, forum).

*Of course it is forbidden to use smileys only accessible with the premium account of ***Antzzz***.*

#### 2. Messaging

Besides adding your custom smileys to your private messages, ***ZzzelpScript*** also add a number of new functionnalities.
One of the more important is the presence of fight and hunt analysis. Indeed for every fight or hunt, ***ZzzelpScript*** try to find as much information as possible (levels, losts etc...) and display the whole with an easily readable format.



-------------------

ZzzelpFloods - The attack optimizer
-------------------

To add this library to Antzzz, just add the following code in the head of the website :

~~~~html
<script src="http://zzzelp.fr/ZzzelpScript/ZzzelpFloods/main.js"></script>
~~~~

One of the main mechanic of Antzzz is the optimisation of your attacks. ***ZzzelpFloods*** is an all-in-one solution which allow the user to easily optimise his attacks in a large number of situations.

***ZzzelpFloods*** is part of the ***ZzzelpScript*** project but it can also be used independently. Any developper can integrate ***ZzzelpFloods*** to his script by following the guidelines. Here is a small example of data needed to launch your own ***ZzzelpFloods***.

~~~javascript
var element = document.querySelector('#my_area');
var data = {
    username        : "john",
    server          : "s1",
    attack_speed    : 30,
    capacity        : 1500000,
    method          : 'classic',
    coordinates     : {
        john    : { x : 10, y : 20, ID : 200, TDC : 3000000 },
        bob     : { x : 20, y : 20, ID : 350, TDC : 4000000 }
    },
    ...
}
new ZzzelpFloods(element, data);
~~~

##### Available options :

###### Non optionnals :
* username : username of the user which is using ***ZzzelpFloods***
* server : *Antzzz* server on which ***ZzzelpFloods*** is currently being used
* attack_speed : attack speed of the user
* capacity : number of units in the army of the user
* method : type of optimization to compute (more details below)
* coordinates : needed data about the accounts implicated in this optimization

###### Optionnals
* options : boolean telling ***ZzzelpFloods*** whether or not it should display the **Option** table
* probes : probe scheme used by the user, ex :
~~~~javascript
[
    { unite : 10, value : 10000 },  // probe for the Dome
    { unite : 10, value : 1 }       // probe for the Nest
]
~~~~
* antiprobes : antiprobe scheme used by the user (same structure as the probe scheme but for the Field and the Dome)
* place_antiprobes : boolean telling ***ZzzelpFloods*** whether or not it should replace the antiprobes of the user after launching the attacks
* storage_zzzelp : boolean telling ****ZzzelpFloods*** whether of not it should store the attacks on ***Zzzelp***
* storage_zzzelp_parameters :  boolean telling ****ZzzelpFloods*** whether of not it should store the parameters of the attacks on ***Zzzelp***
* auto_launch :  boolean telling ****ZzzelpFloods*** whether of not it should launch the attack after the computation


##### Available methods :

* classic : take as many field as possible
* attacker_field : put the attacker at the right field amount
* target_field : put the target at the right field amount
* army_end : same as classic method but put the remaining units on the last attack
* army_begin : same as classic method but put the remaining units on the first attack
* attack_repetition : load several time the same attack
* full_army : one attack with the whole army
* full_army_probe : one attack preceded by a probe in the Dome
* probe : one probe in the Dome and one in the Nest
* manual : let the user add manually the attacks or probe that he want to launch



-------------------

ZzzelpAccount
-------------------

To add this library to Antzzz, just add the following code in the head of the website :

~~~~html
<script src="http://zzzelp.fr/ZzzelpScript/account.js"></script>
~~~~

This object allow you to easily interact with the Antzzz account of your user.
Here a few use cases :

~~~~javascript
// Retrieve the current TDP of the user (sum of all the levels used to calculate the lay speed
var account = new ZzzelpAccount();
account.onReady = function() {
    console.log(this.getTDP());
}
~~~~

~~~~javascript
// Retrieve the number of worker of the account (get the current data and not a cache stored one)
var account = new ZzzelpAccount();
account.onReady = function() {
    console.log(this.getWorkersAjax());
}
~~~~

To avoid useless request, the levels of the account are updated once per day. However, it is possible tu force the update as shown below

~~~~javascript
account.update();
~~~~

You can also use this object to easily send data to ***Zzzelp***

~~~~javascript
account.storeWorkers();
account.storeLevels(document, "construction");
account.storeLevels(document, "laboratoire");
~~~~


-------------------

ZzzelpArmy
-------------------

To add this library to Antzzz, just add the following code in the head of the website :

~~~~html
<script src="http://zzzelp.fr/ZzzelpScript/army.js"></script>
~~~~

This object provide a large amount of methods to work with an army.
To do so, you just have to provide the units present in this army and the levels usefull to calculate the statistics.
The units must be stored in an array an be in the same order as on the *Queen* page.

~~~~javascript
var units = [1000000, 0, 0, 200000, 0, 0, 0, 0, 0, 0, 100000, 0, 0, 100000];
var levels = {
    dome    : 30,
    nest    : 30,
    shield  : 20,
    weapons : 20
}
var army = new ZzzelpArmy(units, levels);
~~~~


On of the main goal of this object is to create statistics about an army. Here are a few example of data that can be created with *ZzzelpArmy* :

~~~~javascript
var attack = army.getRealAttack();
var defense = army.getRealDefense();
...
var data = army.getRealStatistics(); // returns an object that contains all the statistics of this army
~~~~

You can also easily get modified version of your army like get it with all the units to there maximal experience level or with no experience at all.

~~~~javascript
var newArmy = army.XP();
var newArmy = army.noXP();
~~~~

This object also provide a set of methods to guess the level of a player according to a certain set of data.

~~~~javascript
var attack = {
    withBonus : 200000,
    withoutBonus : 100000
}
army.computeArmes(attack);
var weapon = army.getWeapons(); // returns 10

// Guess the life levels of a user by giving the resuls of a fight
var dead = 300000 // Units killed by the attacked during this round
army.computeLifeLevels(dead, attack);
var shield = army.getShield();
var placeLevel = army.getPlaceLevel();
~~~~

Finnaly, *ZzzelpScript* give you tools to easily retrieve the army of a user from various places

~~~~javascript
var callBack = function() {
    console.log(army);
}
ZzzelpArmy.getArmyAjax(callBack); // get the army from the Army Page
ZzzelpArmy.getArmyQueen(callBack); // get the army from the Queen Page, only works with premium account

var armyTxt = "Attacking troops :20 000 000 Young dwarves, 30 000 000 Young soldiers, 25 000 000 Soldiers, 25 000 000 Top soldiers, 10 000 000 Tanks, 5 300 000 Killers."
var army = ZzzelpArmy.analyse(armyTxt);
~~~~

Here is a full example of a script that compare the attack of the user with the attack of a given army without the bonuses :

~~~~html
<input id="army" type="text">
<script>
    document.querySelector('#army').onclick = function() {
        var callBack = function(userArmy) {
            var superior = userArmy.getAttack() > givenArmy.getAttack();
        }
        var givenArmy = ZzzelpArmy.analyse(this.value);
        ZzzelpArmy.getArmyAjax(callBack);
    }
</script>
~~~~


-------------------

ZzzelpCoordinates
-------------------

To add this library to Antzzz, just add the following code in the head of the website :

~~~~html
<script src="http://zzzelp.fr/ZzzelpScript/coordinates.js"></script>
~~~~

*Zzzelp* provide a few public requests to help developper retrieving data from the public database of Antzzz without needing a web server. For example, it provides an easy way to retrieve the coordinates of a user.
To avoid useless requests, the coordinates are stored locally, *ZzzelpCoordinates* only call ***Zzzelp*** when it is usefull.

~~~~javascript
var alliances = ["MyAlliance"];
var players = ["john", "bob"];

new ZzzelpCoordinates(players, alliances, function(coordinates) {
    console.log(coordinates);
})
~~~~

The coordinates returned by ZzzelpCoordinates can be used in ZzzelpFloods. You only need to add the field of every user.



