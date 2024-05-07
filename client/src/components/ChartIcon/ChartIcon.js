import { Card } from 'reactstrap';
import css from '../../assets/css/chartIcon.css';
function ChartIcon() {
    return (
        <div class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-ix1x1p">
            <div class="MuiBox-root css-czs583">
                <span class="MuiTypography-root MuiTypography-lg css-13icpvv">
                    Satisfaction Rate
                </span>
                <span class="MuiTypography-root MuiTypography-button css-vohdlr">
                    From all projects
                </span>
            </div>
            <div class="MuiBox-root css-1ho4tbp">
                <span class="MuiTypography-root MuiTypography-caption css-xsxpyv">
                    0%
                </span>
                <div class="MuiBox-root css-8o8ip5">
                    <h3 class="MuiTypography-root MuiTypography-h3 css-1s23lfz">
                        95%
                    </h3>
                    <span class="MuiTypography-root MuiTypography-caption css-of1kfr">
                        Based on likes
                    </span>
                </div>
                <span class="MuiTypography-root MuiTypography-caption css-xsxpyv">
                    100%
                </span>
            </div>
        </div>
    );
}

export default ChartIcon;
