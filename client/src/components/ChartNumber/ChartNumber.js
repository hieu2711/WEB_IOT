import { useEffect, useState } from 'react';
import css from '../../assets/css/chartNumber.css';
import ChartCirrcle from 'components/ChartCircle/ChartCircle';

function ChartNumber({
    additionalClass,
    dataKali,
    dataPhotPho,
    dataNito,
    dataPower,
    name,
}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 576);
        };

        // Gọi handleResize khi kích thước cửa sổ thay đổi
        window.addEventListener('resize', handleResize);

        // Gỡ bỏ event listener khi component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (
        <div
            className={`MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-7esj6 ${additionalClass.additionalClass === 'additional-white-class' ? 'white-content' : ''}`}
        >
            <div className="MuiBox-root css-dwtd3h">
                <div className="MuiBox-root css-gthrti">
                    <span className="MuiTypography-root MuiTypography-lg css-ikv9x1">
                        {name}
                    </span>
                </div>
                <div className="MuiBox-root css-1hoesrf">
                    <div className="css-mny4et">
                        <div className="MuiBox-root css-wvfoj4">
                            <span className="MuiTypography-root MuiTypography-button css-adlsu3">
                                Nito
                            </span>
                            <span className="MuiTypography-root MuiTypography-lg css-2a6unu">
                                {dataNito} mg/L
                            </span>
                        </div>
                        <div className="MuiBox-root css-wvfoj4">
                            <span className="MuiTypography-root MuiTypography-button css-adlsu3">
                                Photpho
                            </span>
                            <span className="MuiTypography-root MuiTypography-lg css-2a6unu">
                                {dataPhotPho} mg/L
                            </span>
                        </div>
                        <div className="MuiBox-root css-wvfoj4">
                            <span className="MuiTypography-root MuiTypography-button css-adlsu3">
                                Kali
                            </span>
                            <span className="MuiTypography-root MuiTypography-lg css-2a6unu">
                                {dataKali} mg/L
                            </span>
                        </div>
                    </div>
                    {!isMobile && (
                        <div className="circle-progress-wrap">
                            <div className="MuiBox-root css-1ttu4yl">
                                <ChartCirrcle
                                    additionalClass={additionalClass}
                                    data={dataPower}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChartNumber;
