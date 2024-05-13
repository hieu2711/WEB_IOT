import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'contexts/ThemeContext';
import Chart from './Chart';
import Detail from './Detail';
import { Button, ButtonGroup } from 'reactstrap';
import { authApi, endpoints } from 'configs/Apis';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

function Dashboard(props) {
    const [type, setType] = useState('chart');
    const { theme } = useContext(ThemeContext);
    const [additionalClass, setAdditionalClass] = useState('');
    const [info, setInfo] = useState();
    const [number, setNumber] = useState();
    const [dataColapse, setDataColapse] = useState();
    const [hasNewData, setHasNewData] = useState(false);
    const [renderChart, setRenderChart] = useState(1);
    const { t } = useTranslation();
    const language = useSelector((state) => state.language.language);
    useEffect(() => {
        if (theme === 'white-content') {
            setAdditionalClass('additional-white-class');
        } else {
            setAdditionalClass('');
        }

        if (type === 'detail') {
            setType('detail');
        } else {
            setType('chart');
        }
    }, [theme, type]);

    useEffect(() => {
        const loadInfo = async () => {
            let { data } = await authApi().get(endpoints['info']);
            setInfo(data);
            const number = data.filter(
                (item) => item.sensors_name === 'atmosphere_0001',
            );
            setNumber(Math.floor(number[0].sensors_value));
        };

        const loadDataColapse = async () => {
            let { data } = await authApi().get(
                endpoints['chartPowerAndHudmityTop10'],
            );
            setDataColapse(data);
        };
        loadInfo();
        loadDataColapse();
        setHasNewData(false);
    }, [hasNewData]);

    useEffect(() => {
        const eventSource = new EventSource('https://web-iot-server.onrender.com/api/sse');

        eventSource.onmessage = function (event) {
            const newData = JSON.parse(event.data);
            const message = language === 'en' ? 'Data has been updated!' : 'Dữ liệu đã được cập nhật!';
            const title = language === 'en' ? 'Updating data' : 'Cập nhật dữ liệu';
            Swal.fire(title, message, 'success');
            setHasNewData(true);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleButtonClick = () => {
        const newClickCount = renderChart + 1 > 3 ? 1 : renderChart + 1;
        setRenderChart(newClickCount);
    };
    return (
        <>
            <div className="content">
                <div className="d-flex justify-content-end align-items-center">
                    {type === 'chart' && (
                        <Button className="mr-auto" onClick={handleButtonClick}>
                            <i className="fa-solid fa-rotate"></i>
                        </Button>
                    )}
                    <ButtonGroup
                        className="btn-group-toggle float-right"
                        data-toggle="buttons"
                    >
                        <button
                            type="button"
                            onClick={() => setType('chart')}
                            class="btn btn-outline-primary"
                        >
                            {t('chart')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('detail')}
                            class="btn btn-outline-success"
                        >
                            {t('detail')}
                        </button>
                    </ButtonGroup>
                </div>
                {type === 'chart' ? (
                    <Chart
                        data={info}
                        number={number}
                        commondata={dataColapse}
                        newData={hasNewData}
                        renderChart={renderChart}
                    />
                ) : (
                    <Detail
                        additionalClass={additionalClass}
                        data={info}
                        commondata={dataColapse}
                    />
                )}
            </div>
        </>
    );
}

export default Dashboard;
