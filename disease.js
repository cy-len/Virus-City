class Disease
{
    constructor(template, blob)
    {
        this.template = template;
        this.blob = blob;
        
        // Compute the propreties of the disease as a function of blob age
        for (let prop in this.template)
        {
            if (prop === "name")
            {
                this.name = this.template.name;
            }
            else
            {
                this[prop] = this.template[prop](this.blob.age);
            }
        }
        
        this.state = "incubation"; // "incubation", "infection", "immunised", "finished"
        this.timeForState = 0;
    }
    
    update()
    {
        this.timeForState++;

        if (this.blob.health > 95 && this.state == "infection")
        {
            this.state = "immunised";
            this.timeForState = 0;
        }
        
        switch (this.state)
        {
            case "incubation":
                this.blob.health -= this.healthDropIncubation / globalClock.tickPerHours;
                
                if (this.timeForState >= this.incubationDuration)
                {
                    this.state = "infection";
                    this.timeForState = 0;
                }
            break;
            
            case "infection":
                this.blob.health -= this.healthDropInfection / globalClock.tickPerHours;
                
                if (this.timeForState >= this.infectionDuration)
                {
                    this.state = "immunised";
                    this.timeForState = 0;
                }
            break;
            
            case "immunised":
                if (this.timeForState >= this.immunityDuration)
                {
                    this.state = "finished";
                }
            break;
        }

        // check for spread every 1 hour
        let minutes = globalClock.hours - Math.floor(globalClock.hours);
        if (minutes <= 1 / globalClock.tickPerHours)
        {
            this.spread();
        }
    }
    
    spread()
    {
        if (this.state === "infection" || true)
        {
            for (let b of this.blob.tile.entities)
            {
                if (b === this.blob)
                {
                    continue;
                }
                
                // ADD TEST FOR DISTANCE?
                
                // probability of infection
                if (Math.random() < this.transmissionProb)
                {
                    b.getSick(this.template);
                }
            }
        }
    }
}