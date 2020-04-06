class Vector
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    magnitude()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize()
    {
        let mag = this.magnitude();
        if (mag == 0)
        {
            return;
        }

        this.x /= mag;
        this.y /= mag;
    }

    multiply(f)
    {
        this.x *= f;
        this.y *= f;
    }

    static substract(a, b)
    {
        return new Vector(a.x - b.x, a.y - b.y);
    }
}