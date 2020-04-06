class City extends TileMap
{
    constructor(canvas, context)
    {
        super(canvas, context);

        this.buildings = {};

        this.roads = [];
        this.houses = [];

        this.nextTurn = [];
        this.counter = 0;

        this.entities = [];
    }

    addEntity(e)
    {
        this.entities.push(e);
        e.map = this;
    }

    propagateRoad(x, y)
    {
        if (this.counter >= 2500)
        {
            return;
        }
        
        this.counter++;
        
        let neighbours = this.cartesianNeighbours(x, y).filter((t) => {
            return (t.type == "road");
        });

        if (neighbours.length != 1)
        {
            return; // No "square" patterns or no adjacent road
        }

        let parent = neighbours[0];

        let xOffset = parent.pos.x - x,
            yOffset = parent.pos.y - y;
        
        let child = this.tileAt(x - xOffset, y - yOffset);
        if (child)
        {
            child.type = "road";
            child.colorFromType();

            this.nextTurn.push(child);
        }
        else
        {
            return;
        }

        let branchThreshold = Math.pow(1 / this.euclidianDistanceTo(75, 75, child.pos.x, child.pos.y), 0.5);

        if (Math.random() < branchThreshold)
        {
            if (xOffset == 0)
            {
                xOffset = Math.random() < 0.5 ? -1 : 1;
                yOffset = 0;
            }
            else
            {
                yOffset = Math.random() < 0.5 ? -1 : 1;
                xOffset = 0;
            }

            let secondNeighbours = this.allNeighbours(x - xOffset, y - yOffset).filter((t) => {
                return (t.type == "road");
            });

            if (secondNeighbours.length > 3)
            {
                return; // No "square" patterns or no adjacent road
            }

            let secondChild = this.tileAt(x - xOffset, y - yOffset);
            if (secondChild)
            {
                secondChild.type = "road";
                secondChild.colorFromType();
                this.nextTurn.push(secondChild);
            }
        }
    }

    generateCity()
    {
        this.counter = 0;
        this.tilesFromType = {};
        this.roads = [];
        this.houses = [];

        let centerX = Math.floor(this.width / 2);
        let centerY = Math.floor(this.height / 2);

        let root = this.tileAt(centerX, centerY);
        root.type = "road";
        root.colorFromType();

        let secondRoot = this.tileAt(centerX + 1, centerY);
        secondRoot.type = "road";
        secondRoot.colorFromType();
        this.propagateRoad(centerX + 1, centerY);

        while (this.nextTurn.length > 0)
        {
            let turn = this.nextTurn;
            this.nextTurn = [];

            for (let t of turn)
            {
                this.propagateRoad(t.pos.x, t.pos.y);
            }
        }

        let buildings = [];

        this.forEach((t) => {
            t.colorFromType();
            if (t.type == "road")
            {
                this.roads.push(t);
            }
            if (t.type != "empty")
            {
                return;
            }

            let neighbours = this.cartesianNeighbours(t.pos.x, t.pos.y).filter((n) => {
                return (n.type == "road");
            });

            if (neighbours.length > 0)
            {
                t.type = "house";
                t.colorFromType();
                buildings.push(t);
            }
        });

        const buildingTypes = {
            "hospital": {
                array: [],
                minDistance: 40
            },
            "cinema": {
                array: [],
                minDistance: 40
            },
            "food-shop": {
                array: [],
                minDistance: 4
            },
            "goodies-shop": {
                array: [],
                minDistance: 4
            },
            "office": {
                array: [],
                minDistance: 3
            },
            "school": {
                array: [],
                minDistance: 10
            }
        };

        buildings.forEach((b) => {
            for (let type in buildingTypes)
            {
                const bt = buildingTypes[type];

                let array = bt.array;

                let minDist = Infinity;

                for (let a of array)
                {
                    let dist = this.euclidianDistanceTo(b.pos.x, b.pos.y, a.pos.x, a.pos.y);

                    if (dist < minDist)
                    {
                        minDist = dist;
                    }
                }

                if (minDist > bt.minDistance)
                {
                    let dice = Math.random();
                    if (dice < 0.05)
                    {
                        if (type == "hospital")
                        {
                            b.capacity = 40 + Math.floor(Math.random() * 20);
                            b.patientsCount = 0;
                        }
                        b.type = type;
                        b.colorFromType();
                        array.push(b);
                        
                        let buildingTypeArray = this.buildings[b.type];
                        if (buildingTypeArray)
                        {
                            buildingTypeArray.push(b);
                        }
                        else
                        {
                            this.buildings[b.type] = [b];
                        }
                        return;
                    }
                }
            }

            // If we arrived here the type remained unchanged and it's still a house
            this.houses.push(b);
        });
    }

    update()
    {
        // attach entities to the tile (to decrease computation time for the interactions between entities)
        this.entities.forEach((e) => {
            if (e.tile)
            {
                let index = e.tile.entities.indexOf(e);
                if (index >= 0)
                {
                    e.tile.entities.splice(index, 1);
                }
            }

            let normalizedX = Math.floor(e.x / this.tileSize);
            let normalizedY = Math.floor(e.y / this.tileSize);

            let tile = this.tileAt(normalizedX, normalizedY);

            e.tile = tile;
            tile.entities.push(e);
        });

        this.entities.forEach((e) => {
            e.update();
        });
    }

    render()
    {
        super.render();

        this.entities.forEach((e) => {
            e.render(this.context);
        });
    }
}

class CityTile extends Tile
{
    constructor(x, y, s)
    {
        super(x, y, s);

        this.type = "empty";
        this.colorFromType();

        this.entities = [];
    }

    onMouseIn() {}

    onMouseOut() {}

    onClick(event) {}

    render(context)
    {
        context.fillStyle = this.color;
        context.fillRect(this.pos.x * this.pos.size, this.pos.y * this.pos.size, this.pos.size, this.pos.size);
    }

    colorFromType()
    {
        switch (this.type)
        {
            case "empty":
                this.color = "rgba(0, 0, 0, 0)";
            break;

            case "house":
                this.color = "black";
            break;

            case "road":
                this.color = "grey";
            break;

            case "garden":
                this.color = "green";
            break;

            case "hospital":
                this.color = "red";
            break;

            case "cinema":
                this.color = "yellow";
            break;

            case "food-shop":
                this.color = "orange";
            break;

            case "goodies-shop":
                this.color = "cyan";
            break;

            case "office":
                this.color = "lightblue";
            break;

            case "school":
                this.color = "lightgreen";
            break;
        }
    }
}