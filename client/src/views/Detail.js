import ChartCommon from 'components/ChartCommon/ChartCommon';
import ChartNumber from 'components/ChartNumber/ChartNumber';
import Item from 'components/Item/Item';
import { authApi, endpoints } from 'configs/Apis';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';

function Detail({ data, additionalClass, commondata }) {
    const [temp, setTemp] = useState();
    const [power, setPower] = useState();
    const [atmosphere, setAtmosphere] = useState();
    const [co2, setCo2] = useState();
    const [nito, setNito] = useState();
    const [photpho, setPhotPho] = useState();
    const [kali, setKali] = useState();
    const [illuminance, setIlluminance] = useState();
    const [dataChartCommon, setDataChartCommon] = useState();
    const { t } = useTranslation();
    const language = useSelector((state) => state.language.language);
    useEffect(() => {
        const filteredTemperatures = data.filter(
            (item) => item.sensors_name === 'temp_0001',
        );
        setTemp(Math.round(filteredTemperatures[0]?.sensors_value));
        const filteredPower = data.filter(
            (item) => item.sensors_name === 'power_0001',
        );
        setPower(filteredPower[0]?.sensors_value * 100);
        const filteredAtmosphere = data.filter(
            (item) => item.sensors_name === 'atmosphere_0001',
        );
        setAtmosphere(Math.round(filteredAtmosphere[0]?.sensors_value));
        const filteredCo2 = data.filter(
            (item) => item.sensors_name === 'CO2_0001',
        );
        setCo2(Math.round(filteredCo2[0]?.sensors_value));
        const filteredPhoPho = data.filter(
            (item) => item.sensors_name === 'Photpho_0002',
        );
        setPhotPho(Math.round(filteredPhoPho[0]?.sensors_value));
        const filteredKali = data.filter(
            (item) => item.sensors_name === 'Kali_0002',
        );
        setKali(Math.round(filteredKali[0]?.sensors_value));
        const filteredNito = data.filter(
            (item) => item.sensors_name === 'Nito_0002',
        );
        setNito(Math.round(filteredNito[0]?.sensors_value));
        const filteredIlluminance = data.filter(
            (item) => item.sensors_name === 'illuminance_0001',
        );
        setIlluminance(Math.round(filteredIlluminance[0]?.sensors_value));
    }, [data]);
    useEffect(() => {
        const loadData = async () => {
            let { data } = await authApi().get(
                endpoints['chartHumidityAndNoise'],
            );
            setDataChartCommon(data);
        };
        loadData();
    }, []);
    return (
        <>
            <Row>
                <Col lg="3" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'thermostat'}
                        value={temp}
                        unit={'°C'}
                        name={language === 'en' ? 'Temperature' : 'Nhiệt độ'}
                    />
                </Col>
                <Col lg="3" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'cloud'}
                        value={atmosphere}
                        unit={'kPa'}
                        name={language === 'en' ? 'Atmosphere' : 'Không khí'}
                    />
                </Col>
                <Col lg="3" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'air'}
                        value={co2}
                        unit={'ppm'}
                        name={language === 'en' ? 'Co2' : 'CO2'}
                    />
                </Col>
                <Col lg="3" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'light_mode'}
                        value={illuminance}
                        unit={'lx'}
                        name={language === 'en' ? 'Illuminance' : 'Chiếu sáng'}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg="6">
                    <ChartNumber
                        additionalClass={additionalClass}
                        dataNito={nito}
                        dataPhotPho={photpho}
                        dataKali={kali}
                        dataPower={power}
                        name={
                            language === 'en'
                                ? 'Prime and energy index'
                                : 'Chỉ số nguyên tố và năng lượng'
                        }
                    />
                </Col>
                <Col lg="6">
                    <ChartCommon
                        additionalClass={additionalClass}
                        data={dataChartCommon}
                        value1={'%'}
                        value2={'dB'}
                        name={
                            language === 'en'
                                ? 'Humidity and Noise chart'
                                : 'Biểu đồ độ ẩm và tiếng ồn'
                        }
                    />
                </Col>
            </Row>
        </>
    );
}

export default Detail;
