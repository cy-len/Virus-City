class DiseaseTemplate
{
    constructor(name, props)
    {
        this.name = name;
        
        // All are functions of blob age
        this.incubationDuration   = props.incubationDuration;
        this.infectionDuration    = props.infectionDuration;
        this.immunityDuration     = props.immunityDuration;
        this.transmissionProb     = props.transmissionProb;
        this.transmissionDistance = props.transmissionDistance;
        this.healthDropIncubation = props.healthDropIncubation;
        this.healthDropInfection  = props.healthDropInfection;
    }
}