import { Card } from 'reactstrap';
import '../../assets/css/item.css';
function Item({ additionalClass, icon, name, value, unit }) {
    return (
        <Card
            className={`card-chart ${additionalClass.additionalClass === 'additional-white-class' ? 'white-content' : ''}`}
            style={{ borderRadius: '20px' }}
        >
            <div class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-1tke72g">
                <div class="MuiBox-root css-7wmvu8">
                    <div class="MuiBox-root css-7wmvu8">
                        <div class="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-undefined css-v3z1wi">
                            <div class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-8 css-18phfu2">
                                <div class="MuiBox-root css-1ie9lhf">
                                    <span class="MuiTypography-root MuiTypography-caption css-17x5xym">
                                        {name}
                                    </span>
                                    <h6 class="MuiTypography-root MuiTypography-subtitle1 css-1br58i5">
                                        {value}{' '}
                                        <span class="MuiTypography-root MuiTypography-button css-7d00n7">
                                            {unit}
                                        </span>
                                    </h6>
                                </div>
                            </div>
                            <div class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-4 css-nbt530">
                                <div class="MuiBox-root css-uo81m3">
                                    <span class="material-icons">{icon}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default Item;
