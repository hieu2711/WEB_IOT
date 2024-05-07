import ChartColapse from 'components/ChartColapse/ChartColapse';
import ChartColumn from 'components/ChartColumn/ChartColumn';
import ChartColumnAndLine from 'components/ChartColumnAndLine/ChartColumnAndLine';
import TableContent from 'components/TableContent/TableContent';
import { authApi, endpoints } from 'configs/Apis';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Col, Input, Row } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import '../assets/scss/black-dashboard-react/custom/statistical.scss';
import ChartCheckServer from 'components/ChartCheckServer/ChartCheckServer';
function Statistical() {
    const [type, setType] = useState('');
    const [dataTable, setDataTable] = useState();
    const [data, setData] = useState();
    const [dataColapse, setDataColapse] = useState([]);
    const [dataTemp, setDataTemp] = useState([]);
    const [selectedDay, setSelectedDay] = useState('');
    const [startClicked, setStartClicked] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStartDay, setSelectedStartDay] = useState('');
    const [selectedEndDay, setSelectedEndDay] = useState('');
    const [checkServer, setCheckServer] = useState('');
    const { t } = useTranslation();
    const language = useSelector((state) => state.language.language);
    const fetchData = async () => {
        if (selectedDay !== '') {
            const info = selectedDay.split('-');
            let { data } = await authApi().get(
                endpoints['chartHumidityAndPower'](info[0], info[1], info[2]),
            );
            setData(data);

            let dataColapse = await authApi().get(
                endpoints['chartNoiseAndAtmosphereByMonthAndDay'](
                    info[0],
                    info[1],
                    info[2],
                ),
            );
            setDataColapse(dataColapse.data);

            let dataTemp = await authApi().get(
                endpoints['chartTempByMonthAndDay'](info[0], info[1], info[2]),
            );
            setDataTemp(dataTemp.data);

            let dataTable = await authApi().get(
                endpoints['tableDetailsMinAndMax'](info[0], info[1], info[2]),
            );
            setDataTable(dataTable.data);
        }

        if (selectedMonth !== '' && selectedYear !== '') {
            let { data } = await authApi().get(
                endpoints['chartHumidityAndPowerByMonth'](
                    selectedYear,
                    selectedMonth,
                ),
            );

            let dataColapse = await authApi().get(
                endpoints['chartNoiseAndAtmosphereByMonthAndDay'](
                    selectedYear,
                    selectedMonth,
                    '',
                ),
            );
            setDataColapse(dataColapse.data);

            let dataTemp = await authApi().get(
                endpoints['chartTempByMonthAndDay'](
                    selectedYear,
                    selectedMonth,
                    '',
                ),
            );
            setDataTemp(dataTemp.data);

            let dataTable = await authApi().get(
                endpoints['tableDetailsMinAndMax'](
                    selectedYear,
                    selectedMonth,
                    '',
                ),
            );
            setDataTable(dataTable.data);

            let dataCheckServer = await authApi().get(
                endpoints['checkServer'](selectedMonth, selectedYear),
            );
            const monthData = dataCheckServer.data.monthData;
            setCheckServer(monthData);

            if (data && data.length > 0) {
                setData(data);
            } else {
                return;
            }
        }

        if (selectedStartDay !== '' && selectedEndDay !== '') {
            try {
                const [
                    dataResponse,
                    colapseDataResponse,
                    dataTempResponse,
                    dataTableResponse,
                ] = await Promise.all([
                    authApi().get(
                        endpoints['chartHumidityAndPowerByTime'](
                            selectedStartDay,
                            selectedEndDay,
                        ),
                    ),
                    authApi().get(
                        endpoints['chartNoiseAndAtmosphereByTime'](
                            selectedStartDay,
                            selectedEndDay,
                        ),
                    ),
                    authApi().get(
                        endpoints['chartTempByTime'](
                            selectedStartDay,
                            selectedEndDay,
                        ),
                    ),
                    authApi().get(
                        endpoints['tableDetailsMinAndMaxByTime'](
                            selectedStartDay,
                            selectedEndDay,
                        ),
                    ),
                ]);

                const { data: data } = dataResponse; // gắn data từ response trả về cho biến data
                const { data: colapseData } = colapseDataResponse;
                const { data: dataTemp } = dataTempResponse;
                const { data: dataTable } = dataTableResponse;

                if (Array.isArray(data) && data.length > 0) {
                    setData(data);
                } else {
                    setData([]);
                }

                if (Array.isArray(colapseData)) {
                    setDataColapse(colapseData);
                } else {
                    setDataColapse([]);
                }

                if (Array.isArray(dataTemp)) {
                    setDataTemp(dataTemp);
                } else {
                    setDataTemp([]);
                }

                if (Array.isArray(dataTable)) {
                    setDataTable(dataTable);
                } else {
                    setDataTable([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const handleStart = () => {
        if (type === 'Day') {
            const currentDate = new Date();
            const selectedDate = selectedDay ? new Date(selectedDay) : null;

            if (!selectedDate) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please choose the date to continue!'
                            : 'Vui lòng chọn ngày để tiếp tục!',
                    icon: 'error',
                });

                return;
            }

            if (
                selectedDate.getFullYear() === currentDate.getFullYear() &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getDate() === currentDate.getDate()
            ) {
                setStartClicked(true);
            } else if (selectedDate > currentDate) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please choose a smaller day or the present day!'
                            : 'Vui lòng chọn ngày nhỏ hơn ngày hiện tại!',
                    icon: 'error',
                });
                return;
            } else {
                setStartClicked(true);
            }
        }

        if (type === 'Month') {
            const month = selectedMonth ? parseInt(selectedMonth) : null;
            const year = selectedYear ? parseInt(selectedYear) : null;
            const currentDate = new Date();

            if (!year || !month) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please fill in information to continue!'
                            : 'Vui lòng chọn đầy đủ thông tin để tiếp tục!',
                    icon: 'error',
                });
                return;
            }

            if (
                month < 1 ||
                month > 12 ||
                year > currentDate.getFullYear() ||
                year < 2023
            ) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please choose the exact time to continue!'
                            : 'Vui lòng chọn thời gian chính xác!',
                    icon: 'error',
                });
                return;
            }
            setStartClicked(true);
        }

        if (type === 'Detail') {
            const currentDate = new Date();
            const startDay = selectedStartDay
                ? new Date(selectedStartDay)
                : null;
            const endDay = selectedEndDay ? new Date(selectedEndDay) : null;

            if (!startDay || !endDay) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please fill in information to continue!'
                            : 'Vui lòng chọn đầy đủ thông tin để tiếp tục!',
                    icon: 'error',
                });
                return;
            }

            if (startDay >= currentDate || endDay >= currentDate) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please choose a smaller day or the present day!'
                            : 'Vui lòng chọn ngày nhỏ hơn ngày hiện tại!',
                    icon: 'error',
                });
                return;
            }

            if (startDay >= endDay) {
                Swal.fire({
                    title:
                        language === 'en'
                            ? 'Statistical Failed!'
                            : 'Thống kê thất bại!',
                    text:
                        language === 'en'
                            ? 'Please choose the starting date less than the end date!'
                            : 'Vui lòng chọn ngày bắt đầu nhỏ hơn ngày kết thúc!',
                    icon: 'error',
                });
                return;
            }

            if (
                endDay.getFullYear() === currentDate.getFullYear() &&
                endDay.getMonth() === currentDate.getMonth() &&
                endDay.getDate() === currentDate.getDate()
            ) {
                setStartClicked(true);
            }
            setStartClicked(true);
        }
    };

    useEffect(() => {
        if (startClicked && selectedDay && type === 'Day') {
            fetchData();
            setStartClicked(false);
        } else if (
            startClicked &&
            selectedMonth &&
            selectedYear &&
            type === 'Month'
        ) {
            setData(null);
            fetchData();
            setStartClicked(false);
        } else if (
            startClicked &&
            selectedStartDay &&
            selectedEndDay &&
            type === 'Detail'
        ) {
            setData(null);
            fetchData();
            setStartClicked(false);
        }
    }, [
        type,
        startClicked,
        selectedDay,
        selectedMonth,
        selectedYear,
        selectedStartDay,
        selectedEndDay,
    ]);
    return (
        <div className="content">
            <div className="d-flex  align-items-center statistical">
                <div className="col-md-3">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {type === 'Day' && (
                                <>
                                    <label className="mr-3">
                                        {t('chooseDay')}
                                    </label>
                                    <Input
                                        className="small-input"
                                        placeholder={t('chooseDay')}
                                        type="date"
                                        style={{ width: '180px' }}
                                        onChange={(e) =>
                                            setSelectedDay(e.target.value)
                                        }
                                    />
                                </>
                            )}
                            {type === 'Month' && (
                                <>
                                    <div>
                                        <label>{t('chooseMonth')}</label>
                                        <Input
                                            className="small-input"
                                            style={{ width: '140px' }}
                                            min={1}
                                            max={12}
                                            placeholder={t('chooseMonth')}
                                            type="number"
                                            onChange={(e) =>
                                                setSelectedMonth(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label> {t('chooseYear')}</label>
                                        <Input
                                            className="small-input"
                                            style={{ width: '140px' }}
                                            placeholder={t('chooseYear')}
                                            type="number"
                                            onChange={(e) =>
                                                setSelectedYear(e.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}
                            {type === 'Detail' && (
                                <>
                                    <div>
                                        <label> {t('startDay')}</label>
                                        <Input
                                            className="small-input"
                                            placeholder="Start Day"
                                            type="date"
                                            onChange={(e) =>
                                                setSelectedStartDay(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label> {t('endDay')}</label>
                                        <Input
                                            className="small-input"
                                            placeholder="End Day"
                                            type="date"
                                            onChange={(e) =>
                                                setSelectedEndDay(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <ButtonGroup
                    className="btn-group-toggle ml-auto"
                    data-toggle="buttons"
                >
                    {type === '' ? (
                        <p className="align-self-center mr-3">
                            {t('typeStatistical')}
                        </p>
                    ) : (
                        <button
                            type="button"
                            class="btn btn-success startButton"
                            onClick={handleStart}
                        >
                            {t('start')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setType('Detail');
                            setSelectedMonth('');
                            setSelectedYear('');
                            setSelectedDay('');
                        }}
                        className="btn btn-outline-primary detailButton"
                    >
                        {t('detail')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setType('Day');
                            setSelectedMonth('');
                            setSelectedYear('');
                            setSelectedStartDay('');
                            setSelectedEndDay('');
                        }}
                        className="btn btn-outline-primary dayButton"
                    >
                        {t('day')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setType('Month');
                            setSelectedDay('');
                            setSelectedStartDay('');
                            setSelectedEndDay('');
                        }}
                        className="btn btn-outline-success monthButton"
                    >
                        {t('month')}
                    </button>
                </ButtonGroup>
            </div>

            <Row>
                <Col className="mt-4" xs="12">
                    {data && data.length > 0 ? (
                        <ChartColumnAndLine
                            data={data}
                            unit1={'kW'}
                            unit2={'%'}
                            name={
                                language === 'en'
                                    ? 'Energy statistics and humidity'
                                    : 'Thống kê năng lượng và độ ẩm'
                            }
                            update={language}
                        />
                    ) : (
                        <div></div>
                    )}
                </Col>
                <Col lg="8">
                    <ChartColapse
                        data={dataColapse}
                        name={
                            language === 'en'
                                ? 'Air and noise statistics'
                                : 'Thống kê không khí và tiếng ồn'
                        }
                        unit1={'kPa'}
                        unit2={'dP'}
                        value1={'noise'}
                        value2={'atmosphere'}
                        update={language}
                    />
                </Col>
                <Col lg="4">
                    <ChartColumn
                        data={dataTemp}
                        unit={'°C'}
                        name={
                            language === 'en'
                                ? 'Temperature statistics'
                                : 'Thống kê nhiệt độ'
                        }
                        update={language}
                    />
                </Col>

                {data && data.length > 0 ? (
                    <>
                        {type === 'Month' && (
                            <Col className="mt-4" xs="12">
                                <ChartCheckServer
                                    data={checkServer}
                                    unit={'error'}
                                    name={
                                        language === 'en'
                                            ? 'System statistics error'
                                            : 'Thống kê hệ thống khi xảy ra lỗi'
                                    }
                                    update={language}
                                />
                            </Col>
                        )}
                        <Col lg="12" md="12">
                            <TableContent
                                value={'Value'}
                                valueMin={'MIN'}
                                valueMax={'MAX'}
                                unit={'Unit'}
                                data={dataTable}
                                name={
                                    language === 'en'
                                        ? 'Statistical tables'
                                        : 'Bảng thống kê chi tiết'
                                }
                            />
                        </Col>
                    </>
                ) : (
                    <h3 className="text-warning mt-4 mx-auto d-block w-50 text-center">
                        {t('noData')}
                    </h3>
                )}
            </Row>
        </div>
    );
}

export default Statistical;
