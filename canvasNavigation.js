let cameraSpeed = 10;

function clearAndUpdateCamera()
{
    const transform = context.getTransform();

    context.clearRect(-transform.e / transform.a, -transform.f / transform.a, width / transform.a, height / transform.a);
    
    context.translate(movingDirection.x * cameraSpeed / transform.a, movingDirection.y * cameraSpeed / transform.a);
    context.scale(movingDirection.z, movingDirection.z);
}

let movingDirection = {
    x: 0,
    y: 0,
    z: 1
};
document.addEventListener("keydown", (e) => {
    switch (e.keyCode)
    {
        case 65:
            movingDirection.x = 1;
        break;

        case 68:
            movingDirection.x = -1;
        break;

        case 87:
            movingDirection.y = 1;
        break;

        case 83:
            movingDirection.y = -1;
        break;

        case 79:
            movingDirection.z = 0.9;
        break;

        case 73:
            movingDirection.z = 1.1;
        break;

        case 67:
            toggleLeftPanel();
        break;
    }
});
document.addEventListener("keyup", (e) => {
    switch (e.keyCode)
    {
        case 65:
            movingDirection.x = 0;
        break;

        case 68:
            movingDirection.x = 0;
        break;

        case 87:
            movingDirection.y = 0;
        break;

        case 83:
            movingDirection.y = 0;
        break;

        case 79:
            movingDirection.z = 1;
        break;

        case 73:
            movingDirection.z = 1;
        break;
    }
});