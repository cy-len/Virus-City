class TileMap
{
    constructor(canvas, context)
    {
        this.tiles = [];
        this.width = 0;
        this.height = 0;

        this.tileSize = 0;

        this.canvas = canvas;

        this.previouslyHoveredTilePos = {x: -1, y: -1};

        if (canvas)
        {
            this.canvas.addEventListener("mousemove", (e) => {
                let worldPos = this.screenToWorldCoordinates(e.clientX, e.clientY);

                let pos = this.tileCoordsAtWorldPos(worldPos.x, worldPos.y);
                if (pos.x == this.previouslyHoveredTilePos.x && pos.y == this.previouslyHoveredTilePos.y)
                {
                    return;
                }

                let tile = this.tileAt(pos.x, pos.y);
                if (tile)
                {
                    tile.onMouseIn(e);
                }
                let prevTile = this.tileAt(this.previouslyHoveredTilePos.x, this.previouslyHoveredTilePos.y);
                if (prevTile)
                {
                    prevTile.onMouseOut(e);
                }

                this.previouslyHoveredTilePos = pos;
            });

            this.canvas.addEventListener("click", (e) => {
                let worldPos = this.screenToWorldCoordinates(e.clientX, e.clientY);
                
                let pos = this.tileCoordsAtWorldPos(worldPos.x, worldPos.y);
                let tile = this.tileAt(pos.x, pos.y);
                if (tile)
                {
                    tile.onClick(e);
                }

                this.onClick(tile, e);
            })
        }
        this.context = context;
    }

    onClick(tile, event) {}

    init(w, h, ts, tileConstructor)
    {
        this.width = w;
        this.height = h;
        this.tileSize = ts;

        for (let x = 0; x < w; x++)
        {
            let col = [];
            for (let y = 0; y < h; y++)
            {
                col.push(tileConstructor(x, y, this.tileSize));
            }
            this.tiles.push(col);
        }
    }

    tileAt(x, y)
    {
        if (x < 0 || x >= this.tiles.length || y < 0)
            return null;
        
        let col = this.tiles[x];
        if (y >= col.length)
            return;
        
        return col[y];
    }

    tileCoordsAtWorldPos(x, y)
    {
        return {
            x: Math.floor(x / this.tileSize),
            y: Math.floor(y / this.tileSize)
        };
    }

    tileCoordsToWorldPos(x, y)
    {
        return {
            x: x * this.tileSize,
            y: y * this.tileSize
        };
    }

    screenToWorldCoordinates(x, y)
    {
        const transform = this.context.getTransform();
        return {
            x: (x - transform.e) / transform.a,
            y: (y - transform.f) / transform.a
        };
    }

    render()
    {
        for (let x = 0; x < this.width; x++)
        {
            let xPos = x * this.tileSize;

            for (let y = 0; y < this.height; y++)
            {
                let tile = this.tileAt(x, y);

                if (tile)
                {
                    tile.render(this.context, xPos, y * this.tileSize, this.tileSize);
                }
            }
        }
        
        this.context.strokeStyle = "black";
        this.context.lineWidth = 1;
        this.context.beginPath();
        for (let x = 0; x < this.width; x++)
        {
            this.context.moveTo(x * this.tileSize, 0);
            this.context.lineTo(x * this.tileSize, this.height * this.tileSize);
        }
        for (let y = 0; y < this.height; y++)
        {
            this.context.moveTo(0, y * this.tileSize);
            this.context.lineTo(this.width * this.tileSize, y * this.tileSize);
        }
        this.context.stroke();
    }

    manhattanDistanceTo(startX, startY, endX, endY)
    {
        return Math.abs(endX - startX) + Math.abs(endY - startY);
    }

    euclidianDistanceTo(startX, startY, endX, endY)
    {
        let dx = endX - startX, dy = endY - startY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findPath(startX, startY, endX, endY, allowDiagonals, heuristics, isValidCallback)
    {
        let startTile = this.tileAt(startX, startY);
        startTile.pathfindingProps.g = 0;
        startTile.pathfindingProps.f = heuristics(startX, startY, endX, endY);
        const openSet = [startTile];
        const closeSet = [];
        const visited = [startTile];

        while (openSet.length > 0)
        {
            // Find lowest f-value
            let currentIndex = 0;
            let current = openSet[currentIndex];
            for (let i = 1; i < openSet.length; i++)
            {
                let challenger = openSet[i];
                if (challenger.pathfindingProps.f < current.pathfindingProps.f)
                {
                    current = challenger;
                    currentIndex = i;
                }
            }

            if (current.pos.x == endX && current.pos.y == endY)
            {
                let path = [];

                let ptr = current;
                path.push(ptr);
                while (ptr.pathfindingProps.previous)
                {
                    path.unshift(ptr.pathfindingProps.previous);
                    ptr = ptr.pathfindingProps.previous;
                }

                for (let t of visited)
                {
                    t.pathfindingProps = {
                        f: Infinity,
                        g: Infinity,
                        previous: null
                    };
                }

                return path;
            }

            closeSet.push(current);
            openSet.splice(currentIndex, 1);

            let neighbours = [
                this.tileAt(current.pos.x - 1, current.pos.y),
                this.tileAt(current.pos.x + 1, current.pos.y),
                this.tileAt(current.pos.x, current.pos.y - 1),
                this.tileAt(current.pos.x, current.pos.y + 1)
            ];
            if (allowDiagonals)
            {
                neighbours.push(this.tileAt(current.pos.x - 1, current.pos.y - 1));
                neighbours.push(this.tileAt(current.pos.x + 1, current.pos.y - 1));
                neighbours.push(this.tileAt(current.pos.x - 1, current.pos.y + 1));
                neighbours.push(this.tileAt(current.pos.x + 1, current.pos.y + 1));
            }

            for (let n of neighbours)
            {
                if (n && isValidCallback(n))
                {
                    if (!closeSet.includes(n))
                    {
                        let g = current.pathfindingProps.g + 1;
                        if (g < n.pathfindingProps.g)
                        {
                            visited.push(n);
                            
                            n.pathfindingProps.previous = current;
                            n.pathfindingProps.g = g;
                            n.pathfindingProps.f = n.pathfindingProps.g + heuristics(n.pos.x, n.pos.y, endX, endY);

                            if (!openSet.includes(n))
                            {
                                openSet.push(n);
                            }
                        }
                    }
                }
            }
        }

        // no solutions
        for (let t of visited)
        {
            t.pathfindingProps = {
                f: Infinity,
                g: Infinity,
                previous: null
            };
        }

        return null;
    }

    forEach(callback)
    {
        this.tiles.forEach((col) => {
            col.forEach(callback);
        });
    }

    allNeighbours(x, y)
    {
        let ns = [];

        for (let xOffset = -1; xOffset <= 1; xOffset++)
        {
            for (let yOffset = -1; yOffset <= 1; yOffset++)
            {
                if (!(xOffset == 0 && yOffset == 0))
                {
                    let n = this.tileAt(x + xOffset, y + yOffset);
                    if (n)
                    {
                        ns.push(n);
                    }
                }
            }
        }

        return ns;
    }

    cartesianNeighbours(x, y)
    {
        let n = [];

        let north = this.tileAt(x, y - 1);
        if (north)
        {
            n.push(north);
        }
        let south = this.tileAt(x, y + 1);
        if (south)
        {
            n.push(south);
        }
        let east = this.tileAt(x + 1, y);
        if (east)
        {
            n.push(east);
        }
        let west = this.tileAt(x - 1, y);
        if (west)
        {
            n.push(west);
        }

        return n;
    }
}

class Tile
{
    constructor(x, y, s)
    {
        this.pathfindingProps = {
            f: Infinity,
            g: Infinity,
            previous: null
        };
        this.pos = {
            x: x,
            y: y,
            size: s
        };
    }

    worldPos()
    {
        return {
            x: this.pos.x * this.pos.size,
            y: this.pos.y * this.pos.size
        };
    }

    onMouseIn(event) {}

    onMouseOut(event) {}

    onClick(event) {}

    render(context) {}
}