export default function complexGradient (colourStops) {
    return 'linear-gradient(90deg, ' + colourStops.map((stop, index) => {
        let colour = '';
        if (index) {
            colour = `${colourStops[index - 1].colour} ${stop.position}%, `;
        }
        return colour + `${stop.colour} ${stop.position}%`;
    }).join(', ') + ')';
}
