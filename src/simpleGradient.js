export default function simpleGradient (colourStops) {
    return 'linear-gradient(90deg, ' + colourStops.map((stop) => {
        return `${stop.colour} ${stop.position}%`;
    }).join(', ') + ')';
}
