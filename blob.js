class Blob extends AutonomousEntity
{
    constructor(x, y, s)
    {
        super(x, y, 15);

        this.age = -1;

        this.state = {
            name: "home",
            beginTime: -1,
            detail: {}
        };

        this.home = {
            tile: null // Has to be a tile of type house
        };
        this.job = {
            tile: null, // tile of any type except house and road
            startTime: -1, // in hours, 9.5 is 9h30
            endTime: -1, // same
            daysOfTheWeek: [] // for monday-to-friday job : [true, true, true, true, true, false, false]
        };

        this.health = 100;
        this.diseases = [];
        this.ownDefenses = Math.random() * 0.2;
    }

    getSick(template)
    {
        for (let d of this.diseases)
        {
            if (d.name == template.name)
            {
                return;
            }
        }

        if (Math.random() < this.ownDefenses)
        {
            return;
        }

        let d = new Disease(template, this);
        this.diseases.push(d);
        incrementInfectedCount();
    }

    onClick()
    {
        openRightPanel(this);
    }

    setState(state, payload)
    {
        if (this.state.name == "at hospital")
        {
            console.log(state, payload, this.health, this);
        }
        this.state.name = state;
        this.state.beginTime = globalClock.hours;
        this.state.detail = payload;
    }

    generate(homeTile, blobsInHouse)
    {
        this.home.tile = homeTile;
        // Each blob consumes a "food item" a day
        if (this.home.tile.foodSupply) // Happily JS is weakly typed
        {
            this.home.tile.foodSupply += 3;
        }
        else
        {
            this.home.tile.foodSupply = 3;
        }
        
        // if first in this house, random age
        if (blobsInHouse.length < 1)
        {
            this.age = 2 + Math.floor(Math.random() * 100);
            return;
        }

        let ageAverage = 0;
        for (let b of blobsInHouse)
        {
            ageAverage += b.age;
        }
        ageAverage /= blobsInHouse.length;

        // Old people live with old ones
        if (ageAverage > 60)
        {
            this.age = 60 + Math.floor(Math.random() * 40);
        }
        else if (ageAverage < 18) // Must have a parent
        {
            this.age = 30 + Math.floor(Math.random() * 30);
        }
        else
        {
            if (Math.random() < 0.5) // 50% chance to become a child
            {
                this.age = 2 + Math.floor(Math.random() * 16);
            }
            else
            {
                this.age = 18 + Math.floor(Math.random() * 42);
            }
        }
    }

    setJob(type, tile)
    {
        this.job.tile = tile;

        switch (type)
        {
            case "office":
                this.job.startTime = 8 + Math.round(Math.random() * 2);
                this.job.endTime = this.job.startTime + 7 + Math.round(Math.random() * 2);
                this.job.daysOfTheWeek = [true, true, true, true, true, false, false];
            break;
            
            case "school":
                this.job.startTime = 8;
                this.job.endTime = 18;
                this.job.daysOfTheWeek = [true, true, true, true, true, false, false];
            break;

            case "food-shop":
                this.job.startTime = 8;
                this.job.endTime = 18;
                this.job.daysOfTheWeek = [true, true, true, true, true, true, false];
            break;

            case "goodies-shop":
                this.job.startTime = 8;
                this.job.endTime = 18;
                this.job.daysOfTheWeek = [true, true, true, true, true, true, false];
            break;

            case "cinema":
                this.job.startTime = 11;
                this.job.endTime = 23;
                this.job.daysOfTheWeek = Math.random() < 0.5 ? [true, true, true, true, false, false, false] : [false, false, false, false, true, true, true];
            break;

            case "hospital":
                this.job.startTime = Math.random() < 0.5 ? 8 : 20;
                this.job.endTime = (this.job.startTime + 12) % 24;
                this.job.daysOfTheWeek = [true, true, true, true, true, true, true];
            break;
        }
    }

    onTargetReached()
    {
        switch (this.state.name)
        {
            case "going to job":
                this.setState("working");
            break;

            case "going to school":
                this.setState("learning");
            break;

            case "going to cinema":
                this.setState("watching film");
            break;

            case "taking a walk":
                this.goHome();
            break;

            case "going home":
                this.setState("home");
            break;

            case "going to buy food":
                this.setState("buying food");
            break;

            case "going to buy goodies":
                this.setState("buying goodies");
            break;

            case "going to hospital":
                incrementInHospitalCount();
                this.setState("at hospital", this.state.detail);
            break;
        }
    }

    younglingsBehavior()
    {
        // State Machine
        if (globalClock.days % 7 < 5 && allowedBuildings["school"])
        {
            if (Math.abs(globalClock.hours - 8) < 0.05 && this.state.name != "going to school")
            {
                this.setState("going to school");

                let nearestSchool = this.nearestBuilding("school");
                if (nearestSchool)
                {
                    this.setTarget(nearestSchool.pos.x, nearestSchool.pos.y);
                }
            }
            else if (Math.abs(globalClock.hours - 18) < 0.05 && this.state.name == "learning")
            {
                if (Math.random() < 0.4)
                {
                    this.goHome();
                }
                else
                {
                    this.haveFun(0.6);
                }
            }
        }
        else
        {
            let elapsedTime = Math.abs(globalClock.hours - this.state.beginTime);
            if (this.state.name == "home" && globalClock.hours > 10 && globalClock.hours < 23 && elapsedTime > 2)
            {
                this.haveFun(0.6, 0.4);
            }
        }
    }

    adultBehavior()
    {
        // State Machine

        if (this.job.daysOfTheWeek[globalClock.days % 7])
        {
            if (Math.abs(globalClock.hours - this.job.startTime) < 0.05 && this.state.name != "going to job"  && allowedBuildings[this.job.tile.type])
            {
                this.setState("going to job");
                this.setTarget(this.job.tile.pos.x, this.job.tile.pos.y);
            }
            else if (Math.abs(globalClock.hours - this.job.endTime) < 0.05 && this.state.name == "working")
            {
                let foodProbability = 1 / Math.max(this.home.tile.foodSupply, 1);
                if (Math.random() < foodProbability)
                {
                    this.buyFood();
                }
                else
                {
                    if (Math.random() < 0.7)
                    {
                        this.goHome();
                    }
                    else
                    {
                        this.haveFun(0.2);
                    }
                }
            }
        }
        else // Week-end
        {
            let elapsedTime = Math.abs(globalClock.hours - this.state.beginTime);
            if (this.state.name == "home" && globalClock.hours > 10 && globalClock.hours < 23 && elapsedTime > 2)
            {
                let foodProbability = Math.pow(1 / Math.max(this.home.tile.foodSupply, 1), 4);
                if (Math.random() < foodProbability)
                {
                    this.buyFood();
                }
                else if (Math.random() < 0.05)
                {
                    this.haveFun(0.2, 0.2);
                }
            }
        }
    }

    elderlyBehavior()
    {
        if (globalClock.hours > 8 && globalClock.hours < 17 && this.state.name == "home")
        {
            let elapsedTime = Math.abs(globalClock.hours - this.state.beginTime);
            if (elapsedTime > 4)
            {
                let foodProbability = Math.pow(1 / Math.max(this.home.tile.foodSupply, 1), 4);
                if (Math.random() < foodProbability)
                {
                    this.buyFood();
                }
                else if (Math.random() < 0.05)
                {
                    this.haveFun(0.2, 0.1);
                }
            }
        }
    }

    buyFood()
    {
        if (!allowedBuildings["food-shop"])
        {
            return;
        }

        this.setState("going to buy food");

        let nearestFoodShop = this.nearestBuilding("food-shop");
        if (nearestFoodShop)
        {
            this.setTarget(nearestFoodShop.pos.x, nearestFoodShop.pos.y);
        }
    }

    goHome()
    {
        this.setState("going home");
        this.setTarget(this.home.tile.pos.x, this.home.tile.pos.y);
    }

    goToHospital()
    {
        this.setState("going to hostpital");

        let myPos = {
            x: this.x,
            y: this.y
        };

        let hospitals = [...this.map.buildings["hospital"]];
        hospitals.sort((a, b) => {
            let da = Vector.substract(a.worldPos(), myPos).magnitude();
            let db = Vector.substract(b.worldPos(), myPos).magnitude();

            return da - db;
        });

        let h = hospitals.shift();

        while (h && h.patientsCount >= h.capacity)
        {
            h = hospitals.shift();
        }

        if (!h)
        {
            this.setState("failed to go to hospital");
            return;
        }

        this.setState("going to hospital", {
            tile: h
        });
        this.setTarget(h.pos.x, h.pos.y);
        h.patientsCount++;
    }

    haveFun(cinemaProbability, goodiesProbability)
    {
        if (Math.random() < cinemaProbability && allowedBuildings["cinema"])
        {
            this.setState("going to cinema");

            let nearestCinema = this.nearestBuilding("cinema");
            if (nearestCinema)
            {
                this.setTarget(nearestCinema.pos.x, nearestCinema.pos.y);
            }
        }
        else if (Math.random() < goodiesProbability && allowedBuildings["goodies-shop"])
        {
            this.setState("going to buy goodies");

            let nearestGoodiesShop = this.nearestBuilding("goodies-shop");
            if (nearestGoodiesShop)
            {
                this.setTarget(nearestGoodiesShop.pos.x, nearestGoodiesShop.pos.y);
            }
        }
        else if (walksAllowed)
        {
            this.setState("taking a walk");

            let index = Math.floor(Math.random() * this.map.roads.length);
            let r = this.map.roads[index]
            this.setTarget(r.pos.x, r.pos.y);
        }
    }

    update()
    {
        super.update();
        // this.avoidNeighbouringEntities(0.1);

        if (allowedBuildings[this.tile.type] === false && this.state.name != "going home") // To not check for undefined or null
        {
            this.goHome();
            return;
        }

        if (this.health < 60) // go to the hospital
        {
            if (this.state.name != "at hospital" && this.state.name != "going to hospital")
            {
                let shouldGo = false;
                if (this.state.name == "failed to go to hospital")
                {
                    shouldGo = true;
                }
                this.goToHospital();
                if (shouldGo && this.state.name != "failed to go to hospital")
                {
                    console.log("Should go");
                }
            }
        }
        else if (this.health < 80 && this.state.name != "at hospital")
        {
            if (this.state.name != "home" && this.state.name != "going home")
            {
                this.goHome();
            }
        }
        else if (this.state.name != "at hospital")
        {
            if (this.age > 68)
            {
                this.elderlyBehavior();
            }
            else if (this.age > 18)
            {
                this.adultBehavior();
            }
            else
            {
                this.younglingsBehavior();
            }
        }

        // Global to all age
        switch (this.state.name)
        {
            case "watching film":
                if (Math.abs(this.state.beginTime - globalClock.hours) > 1.5)
                {
                    this.goHome();
                }
            break;
            case "buying food":
                if (Math.abs(this.state.beginTime - globalClock.hours) > 0.5)
                {
                    this.home.tile.foodSupply += Math.floor(Math.random() * 7);
                    this.goHome();
                }
            break;
            case "buying goodies":
                if (Math.abs(this.state.beginTime - globalClock.hours) > 0.5)
                {
                    this.goHome();
                }
            break;
            case "at hospital":
                let isImmunised = true;
                for (let d of this.diseases)
                {
                    if (d.state != "immunised")
                    {
                        isImmunised = false;
                    }
                }

                if (this.health > 85 && isImmunised)
                {
                    this.state.detail.tile.patientsCount--;
                    decrementInHospitalCount();
                    this.goHome();
                }
                else
                {
                    this.health += hospitalEfficiency / globalClock.tickPerHours * (Math.random() / 2 + 0.5)
                }
            break;
        }

        if (this.health < 100)
        {
            if (Math.random() < 0.2)
            {
                this.health += Math.random() / globalClock.tickPerHours;
            }
        }

        for (let i = this.diseases.length - 1; i >= 0; i--)
        {
            let d = this.diseases[i];
            d.update();

            if (d.state == "finished")
            {
                this.diseases.splice(i, 1);
                decrementInfectedCount();
                incrementCuredCount();
            }
        }

        let xInTile = this.x % this.map.tileSize;
        let yInTile = this.y % this.map.tileSize;
        let canRandomWalk = true;
        let walkSpeed = 2;
        if (yInTile < this.map.tileSize * 0.2)
        {
            this.y += walkSpeed;
            canRandomWalk = false;
        }
        else if (yInTile > this.map.tileSize * 0.8)
        {
            this.y -= walkSpeed;
            canRandomWalk = false;
        }
        if (xInTile < this.map.tileSize * 0.2)
        {
            this.x += walkSpeed;
            canRandomWalk = false;
        }
        else if (xInTile > this.map.tileSize * 0.8)
        {
            this.x -= walkSpeed;
            canRandomWalk = false;
        }

        if (canRandomWalk)
        {
            this.x += Math.random() * 2 * walkSpeed - walkSpeed;
            this.y += Math.random() * 2 * walkSpeed - walkSpeed;
        }
    }

    render(context)
    {
        if (this.age > 68)
        {
            context.fillStyle = `rgba(245, 222, 179, ${this.health / 100 * 0.8 + 0.2})`;
        }
        else if (this.age > 18)
        {
            context.fillStyle = `rgba(0, 0, 255, ${this.health / 100 * 0.8 + 0.2})`;
        }
        else
        {
            context.fillStyle = `rgba(255, 0, 255, ${this.health / 100 * 0.8 + 0.2})`;
        }
        
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, 2*Math.PI);

        if (this.diseases.length > 0)
        {
            context.strokeStyle = "red";
            context.lineWidth = 5;
            context.stroke();
        }

        context.fill();
    }

    nearestBuilding(type)
    {
        let buildings = this.map.buildings[type];
        let nearestBuilding = null;
        let minDist = Infinity;

        for (let i = 0; i < buildings.length; i++)
        {
            let s = buildings[i];
            let worldPos = s.worldPos();
            let myPos = {
                x: this.x,
                y: this.y
            };

            let dist = Vector.substract(worldPos, myPos).magnitude();
            if (dist < minDist)
            {
                minDist = dist;
                nearestBuilding = s;
            }
        }

        return nearestBuilding;
    }
}