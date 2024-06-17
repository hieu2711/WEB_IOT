import ChartCommon from 'components/ChartCommon/ChartCommon';
import ChartNumber from 'components/ChartNumber/ChartNumber';
import Item from 'components/Item/Item';
import { SERVER } from 'configs/Apis';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { BeatLoader } from 'react-spinners'; 
import { authApi } from 'configs/Apis';
import { endpoints } from 'configs/Apis';

function Detail({ data, additionalClass, commondata }) {
    const [dataDetail, setDataDetail] = useState([]);
    const [temp, setTemp] = useState(null);
    const [power, setPower] = useState(null);
    const [atmosphere, setAtmosphere] = useState(null);
    const [co2, setCo2] = useState(null);
    const [nito, setNito] = useState(null);
    const [photpho, setPhotPho] = useState(null);
    const [kali, setKali] = useState(null);
    const [illuminance, setIlluminance] = useState(null);
    const [dataChartCommon, setDataChartCommon] = useState(null);
    const [dataMinMax, setDataMinMax] = useState();
    const [noise, setNoise] = useState(null);
    const [humi, setHumi] = useState(null);
    const [hasNewData, setHasNewData] = useState(false);
    const { t } = useTranslation();
    const language = useSelector((state) => state.language.language);
    const [loading, setLoading] = useState(true);
    const day = new Date()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${SERVER}/attributes`);
                const data = await res.json();
                setDataDetail(data);
            } catch (error) {
                console.log('Error fetching data:', error);
            }finally{
                setLoading(false); 
            }
        };

        const loadData = async () => {
            try {
                const { data } = await authApi().get(endpoints['chartHumidityAndNoise']);
                setDataChartCommon(data);
            } catch (error) {
                console.log('Error loading chart data:', error);
            }finally{
                setLoading(false); 
            }
        };
        const loadDataMinMax = async () => {
            try {
                const { data } = await authApi().get(endpoints['tableDetailsMinAndMax'](
                    day.getFullYear(),
                    day.getMonth() + 1,
                    day.getDate() 
                ));
                setDataMinMax(data)
            } catch (error) {
                console.log('Error loading minmax data:', error);
            } finally {
                setLoading(false); 
            }
        }
        fetchData();
        loadData();
        loadDataMinMax();
        setLoading(true)
    }, [hasNewData]);
    useEffect(() => {
        const eventSource = new EventSource(
            'https://web-iot-server.onrender.com/api/sse',
        );

        eventSource.onmessage = function (event) {
            const newData = JSON.parse(event.data);
            setHasNewData(true);
        };

        return () => {
            eventSource.close();
        };
    }, []);
    useEffect(() => {
        const filteredPower = data.filter(
            (item) => item.sensors_name === 'power_0001'
        );
        setPower(filteredPower[0]?.sensors_value);

        if (dataDetail.length > 0) {
            const filteredTemperatures = dataDetail.find(
                (item) => item.attribute === 'temp_0001'
            );
            if (filteredTemperatures) {
                 setTemp(filteredTemperatures)
            }

            const filteredHumi = dataDetail.find(
                (item) => item.attribute === 'humi_0001'
            );
            if (filteredHumi) {
                setHumi(filteredHumi);
            }

            const filteredNoise = dataDetail.find(
                (item) => item.attribute === 'noise_0001'
            );
            if (filteredNoise) {
                setNoise(filteredNoise);
            }

            const filteredAtmosphere = dataDetail.find(
                (item) => item.attribute === 'atmosphere_0001'
            );
            if (filteredAtmosphere) {
                setAtmosphere(filteredAtmosphere);
            }

            const filteredCo2 = dataDetail.find(
                (item) => item.attribute === 'CO2_0001'
            );
            if (filteredCo2) {
                setCo2(filteredCo2);
            }

            const filteredPhoPho = dataDetail.find(
                (item) => item.attribute === 'Photpho_0002'
            );
            if (filteredPhoPho) {
                setPhotPho(filteredPhoPho);
            }

            const filteredKali = dataDetail.find(
                (item) => item.attribute === 'Kali_0002'
            );
            if (filteredKali) {
                setKali(filteredKali);
            }

            const filteredNito = dataDetail.find(
                (item) => item.attribute === 'Nito_0002'
            );
            if (filteredNito) {
                setNito(filteredNito);
            }

            const filteredIlluminance = dataDetail.find(
                (item) => item.attribute === 'illuminance_0001'
            );
            if (filteredIlluminance) {
                setIlluminance(filteredIlluminance);
            }
        }
    }, [dataDetail]);
    return (
        <>
        { loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <BeatLoader color="white" />
            </div>
          ) : 
        (
        <>
            <Row>
                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'thermostat'}
                        value={temp && temp.value}
                        unit={'°C'}
                        name={language === 'en' ? 'Temperature' : 'Nhiệt độ'}
                        max={dataMinMax && dataMinMax[0].max_temp_0001}
                        min={dataMinMax && dataMinMax[0].min_temp_0001}
                        change={temp && temp.trend}
                        stateVi={temp && temp.stateVi}
                        stateEn={temp && temp.stateEn}
                        adviceVi={temp && temp.adviceVi}
                        adviceEn={temp && temp.adviceEn}
                        safe={temp && temp.isSafe}

                    />
                </Col>
                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'opacity'}
                        value={humi && humi.value}
                        unit={'%'}
                        name={language === 'en' ? 'Humidity' : 'Độ ẩm'}
                        max={dataMinMax && dataMinMax[0].max_humi_0001}                        
                        min={dataMinMax && dataMinMax[0].min_humi_0001}
                        change={humi && humi.trend}
                        stateVi={humi && humi.stateVi}
                        stateEn={humi && humi.stateEn}
                        adviceVi={humi && humi.adviceVi}
                        adviceEn={humi && humi.adviceEn}
                        safe={humi && humi.isSafe}
                    />
                </Col>

                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'graphic_eq'}
                        value={noise && noise.value}
                        unit={'dB'}
                        name={language === 'en' ? 'Noise' : 'Tiếng ồn'}
                        max={dataMinMax && dataMinMax[0].max_noise_0001}                        
                        min={dataMinMax && dataMinMax[0].min_noise_0001}
                        change={noise && noise.trend}
                        stateVi={noise && noise.stateVi}
                        stateEn={noise && noise.stateEn}
                        adviceVi={noise && noise.adviceVi}
                        adviceEn={noise && noise.adviceEn}
                        safe={noise && noise.isSafe}
                    />
                </Col>

                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'air'}
                        value={atmosphere && atmosphere.value}
                        unit={'kPa'}
                        name={language === 'en' ? 'Atmosphere' : 'Không khí'}
                        max={dataMinMax && dataMinMax[0].max_atmosphere_0001}
                        min={dataMinMax && dataMinMax[0].min_atmosphere_0001}
                        change={atmosphere && atmosphere.trend}
                        stateVi={atmosphere && atmosphere.stateVi}
                        stateEn={atmosphere && atmosphere.stateEn}
                        adviceVi={atmosphere && atmosphere.adviceVi}
                        adviceEn={atmosphere && atmosphere.adviceEn}
                        safe={atmosphere && atmosphere.isSafe}
                    />
                </Col>
                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'co2'}
                        value={co2 && co2.value}
                        unit={'ppm'}
                        name={language === 'en' ? 'Co2' : 'CO2'}
                        max={dataMinMax && dataMinMax[0].max_CO2_0001}
                        min={dataMinMax && dataMinMax[0].min_CO2_0001}
                        change={co2 && co2.trend}
                        stateVi={co2 && co2.stateVi}
                        stateEn={co2 && co2.stateEn}
                        adviceVi={co2 && co2.adviceVi}
                        adviceEn={co2 && co2.adviceEn}
                        safe={co2 && co2.isSafe}
                    />
                </Col>
                <Col lg="4" className="flex">
                    <Item
                        additionalClass={additionalClass}
                        icon={'light_mode'}
                        value={illuminance && illuminance.value}
                        unit={'lx'}
                        name={language === 'en' ? 'Illuminance' : 'Chiếu sáng'}
                        max={dataMinMax && dataMinMax[0].max_illuminance_0001}
                        min={dataMinMax && dataMinMax[0].min_illuminance_0001}
                        change={illuminance && illuminance.trend}
                        stateVi={illuminance && illuminance.stateVi}
                        stateEn={illuminance && illuminance.stateEn}
                        adviceVi={illuminance && illuminance.adviceVi}
                        adviceEn={illuminance && illuminance.adviceEn}
                        safe={illuminance && illuminance.isSafe}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg="6">
                    <ChartNumber
                        additionalClass={additionalClass}
                        dataNito={nito && nito.value}
                        dataPhotPho={photpho && photpho.value}
                        dataKali={kali && kali.value}
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
         )}
    </>
    );
}

export default Detail;
