class BlobCity extends City
{
    constructor(canvas, context, options)
    {
        super(canvas, context);

        this.init(options.mapSize || 150, options.mapSize || 150, options.tileSize || 100, (x, y, s) => {
            return new CityTile(x, y, s);
        });
        this.generateCity();
        this.populate(options.minBlobsPerHouse, options.maxBlobsPerHouse, options.maxBlobCount);
        this.generateJobs();

        document.addEventListener("click", (e) => {
            let worldPos = this.screenToWorldCoordinates(e.clientX, e.clientY);

            for (let e of this.entities)
            {
                let ePos = {
                    x: e.x,
                    y: e.y
                };
                let d = Vector.substract(worldPos, ePos).magnitude() * context.getTransform().a;
                if (d <= 10)
                {
                    e.onClick();
                    return;
                }
            }

            closeRightPanel();
        });
    }

    populate(minBlobsPerHouse, maxBlobsPerHouse, maxBlobCount)
    {
        let count = 0;
        for (let house of this.houses)
        {
            let blobCount = Math.round(minBlobsPerHouse + (Math.random() * (maxBlobsPerHouse - minBlobsPerHouse)));
            let blobsInHouse = [];

            for (let i = 0; i < blobCount; i++)
            {
                let pos = this.tileCoordsToWorldPos(house.pos.x, house.pos.y);

                let xOffset = house.pos.size / 10 + Math.random() * house.pos.size * 0.8;
                let yOffset = house.pos.size / 10 + Math.random() * house.pos.size * 0.8;
                
                let blob = new Blob(pos.x + xOffset, pos.y + yOffset, 2 + Math.random() * 1.5);
                this.addEntity(blob);
                
                blob.generate(house, blobsInHouse);

                blobsInHouse.push(blob);

                count++;

                if (count >= maxBlobCount)
                {
                    return;
                }
            }
        }
    }

    generateJobs()
    {
        let blobs = this.entities.filter((b) => {
            return (b.age > 18 && b.age < 68);
        });

        for (let b in this.buildings)
        {
            let minEmployees = 1;
            let maxEmployees = 4;
            if (b == "hospital")
            {
                minEmployees = 20;
                maxEmployees = 40;
            }
            else if (b == "office")
            {
                minEmployees = 5;
                maxEmployees = 30;
            }

            let offices = this.buildings[b];
            for (let o of offices)
            {
                let employeesCount = minEmployees + Math.round(Math.random() * (maxEmployees - minEmployees));
                
                for (let i = 0; i < employeesCount; i++)
                {
                    let index = Math.floor(Math.random() * blobs.length);
                    let e = blobs[index];

                    e.setJob(b, o);

                    blobs.splice(index, 1);

                    if (blobs.length <= 0)
                    {
                        return;
                    }
                }
            }
        }
    }

    update()
    {
        super.update();

        for (let i = this.entities.length - 1; i >= 0; i--)
        {
            let b = this.entities[i];

            if (b.health <= 0)
            {
                this.entities.splice(i, 1);
                incrementDeathsCount();
                decrementInfectedCount();

                if (b.state.name == "at hospital")
                {
                    b.tile.patientsCount--;
                    decrementInHospitalCount();
                }
            }
        }
    }
}