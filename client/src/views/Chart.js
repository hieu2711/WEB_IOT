import ChartColapse from 'components/ChartColapse/ChartColapse';
import ChartColumn from 'components/ChartColumn/ChartColumn';
import ChartLine from 'components/ChartLine/ChartLine';
import RoundChart from 'components/RoundChart/RoundChart';
import { authApi, endpoints } from 'configs/Apis';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
function Chart({ data, number, commondata, renderChart }) {
    const [dataTemp, setDataTemp] = useState();
    const [dataPower, setDataPower] = useState();
    const [hasNewData, setHasNewData] = useState(false);
    const language = useSelector((state) => state.language.language);
    useEffect(() => {
        const loadDataTemp = async () => {
            let { data } = await authApi().get(endpoints['chartTemp']);
            setDataTemp(data);
        };

        const loadDataNoise = async () => {
            let { data } = await authApi().get(endpoints['chartPower']);
            setDataPower(data);
        };
        loadDataTemp();
        loadDataNoise();
    }, [hasNewData]);
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:1104/api/sse');

        eventSource.onmessage = function (event) {
            const newData = JSON.parse(event.data);
            // Cập nhật giao diện với dữ liệu mới từ newData
            console.log('Received new data from server:', newData);
            setHasNewData(true);
        };

        return () => {
            eventSource.close();
        };
    }, []);
    return (
        <>
            {renderChart === 1 && (
                <>
                    <Row>
                        <Col xs="12">
                            <ChartColapse
                                data={commondata}
                                unit1={'db'}
                                unit2={'%'}
                                value1={'humi'}
                                value2={'noise'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Humidity and Noise chart'
                                        : 'Biểu đồ độ ẩm và tiếng ồn'
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="4">
                            <ChartLine
                                data={dataPower}
                                unit={'kW'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Power chart'
                                        : 'Biểu đồ năng lượng'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <ChartColumn
                                data={dataTemp}
                                unit={'°C'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Temperature chart'
                                        : 'Biểu đồ nhiệt độ'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <RoundChart
                                number={number}
                                data={dataTemp}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Air quality'
                                        : 'Chỉ số không khí'
                                }
                            />
                        </Col>
                    </Row>
                </>
            )}

            {renderChart === 2 && (
                <>
                    <Row>
                        <Col xs="12">
                            <ChartLine
                                data={dataPower}
                                unit={'kW'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Power chart'
                                        : 'Biểu đồ năng lượng'
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="4">
                            <ChartColumn
                                data={dataTemp}
                                unit={'°C'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Temperature chart'
                                        : 'Biểu đồ nhiệt độ'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <ChartColapse
                                data={commondata}
                                unit1={'db'}
                                unit2={'%'}
                                value1={'humi'}
                                value2={'noise'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Humidity and Noise chart'
                                        : 'Biểu đồ độ ẩm và tiếng ồn'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <RoundChart
                                number={number}
                                data={dataTemp}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Air quality'
                                        : 'Chỉ số không khí'
                                }
                            />
                        </Col>
                    </Row>
                </>
            )}

            {renderChart === 3 && (
                <>
                    <Row>
                        <Col xs="12">
                            <ChartColumn
                                data={dataTemp}
                                unit={'°C'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Temperature chart'
                                        : 'Biểu đồ nhiệt độ'
                                }
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="4">
                            <ChartColapse
                                data={commondata}
                                unit1={'db'}
                                unit2={'%'}
                                value1={'humi'}
                                value2={'noise'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Humidity and Noise chart'
                                        : 'Biểu đồ độ ẩm và tiếng ồn'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <ChartLine
                                data={dataPower}
                                unit={'kW'}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Power chart'
                                        : 'Biểu đồ năng lượng'
                                }
                            />
                        </Col>
                        <Col lg="4">
                            <RoundChart
                                number={number}
                                data={dataTemp}
                                update={language}
                                name={
                                    language === 'en'
                                        ? 'Air quality'
                                        : 'Chỉ số không khí'
                                }
                            />
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}

export default Chart;
