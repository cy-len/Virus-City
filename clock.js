class Clock
{
    constructor(tickPerHours)
    {
        this.tickPerHours = tickPerHours;

        this.days = 0;
        this.hours = 0;

        this.weekDays = ["Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday", "Sunday"];
    }

    update()
    {
        this.hours += 1 / this.tickPerHours;

        if (this.hours >= 24)
        {
            this.hours = 0;
            this.days++;
        }
    }

    toString()
    {
        let h = Math.floor(this.hours);
        let mFloat = this.hours - h;
        let m = Math.floor(mFloat * 60);

        if (h < 10)
        {
            h = "0" + h;
        }

        if (m < 10)
        {
            m = "0" + m;
        }

        let time = h + ":" + m;

        return `Day #${this.days} (${this.weekDays[this.days % 7]}), ${time}`;
    }
}