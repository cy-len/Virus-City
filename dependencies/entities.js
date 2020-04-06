class Entity
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;

        this.tile = null;
        this.map = null;
    }

    onClick() {
        alert("click")
    }

    update() {}

    render(context) {}

    neighbouringEntities()
    {
        if (this.tile)
        {
            let ent = [];
            for (let e of this.tile.entities)
            {
                if (e != this)
                {
                    ent.push(e);
                }
            }
            return ent;
        }
        return [];
    }
}

class MoveableEntity extends Entity
{
    constructor(x, y, s)
    {
        super(x, y);

        this.speed = s;
    }

    move(dx, dy)
    {
        this.x += dx;
        this.y += dy;
    }

    moveInDirection(dir)
    {
        this.move(dir.x * this.speed, dir.y * this.speed);
    }
}

class AutonomousEntity extends MoveableEntity
{
    constructor(x, y, s)
    {
        super(x, y, s);

        this.steps = [];

        this.target = {
            x: -1,
            y: -1
        };

        this.tileValidator = (t) => {
            return (t.type == "road" || (t.pos.x == this.target.x && t.pos.y == this.target.y));
        }
    }

    onTargetReached() {}

    setTarget(x, y)
    {
        this.target.x = x;
        this.target.y = y;
        
        let firstTilePos = this.map.tileCoordsAtWorldPos(this.x, this.y);
        let firstTile = this.map.tileAt(firstTilePos.x, firstTilePos.y);

        let tiles = this.map.findPath(firstTile.pos.x, firstTile.pos.y, x, y, false, this.map.manhattanDistanceTo, this.tileValidator);
        if (tiles)
        {
            this.steps = tiles.map((t) => {
                let worldPos = t.worldPos();
                return {
                    x: worldPos.x + this.map.tileSize * 0.5,
                    y: worldPos.y + this.map.tileSize * 0.5
                };
            });
        }
    }

    moveTowardsTarget()
    {
        if (this.steps.length == 0)
        {
            return;
        }

        let targetPos = this.steps[0];
        let myPos = {
            x: this.x,
            y: this.y
        };

        let dir = Vector.substract(targetPos, myPos);
        dir.normalize();
        this.moveInDirection(dir);

        if (Math.abs(this.x - targetPos.x) < 1.5 * this.speed && Math.abs(this.y - targetPos.y) < 1.5 * this.speed)
        {
            this.steps.shift();

            if (this.steps.length == 0)
            {
                this.onTargetReached();
            }
        }
    }

    // To dramatically improve
    avoidNeighbouringEntities(force)
    {
        if (!force)
        {
            force = 0.5;
        }
        
        let ne = this.neighbouringEntities();

        if (ne.length < 1)
        {
            return;
        }

        let centerOfRepulsion = {
            x: 0,
            y: 0
        };
        for (let e of ne)
        {
            centerOfRepulsion.x += e.x;
            centerOfRepulsion.y += e.y;
        }

        centerOfRepulsion.x /= ne.length;
        centerOfRepulsion.y /= ne.length;
        
        let myPos = {
            x: this.x,
            y: this.y
        };
        let dir = Vector.substract(centerOfRepulsion, myPos);
        dir.normalize();
        this.moveInDirection(dir);

        if (Math.abs(dir.x) <= 1)
        {
            dir.x += (Math.random() - 0.5) * 2;
        }
        if (Math.abs(dir.y) <= 1)
        {
            dir.y += (Math.random() - 0.5) * 2;
        }
        dir.multiply(force);

        this.moveInDirection(dir);
    }

    update()
    {
        super.update();

        this.moveTowardsTarget();
    }
}