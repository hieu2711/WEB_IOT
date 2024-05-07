import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap';

const ChartColumnAndLine = ({ data, unit1, unit2, name, update }) => {
    const [zoomEnabled, setZoomEnabled] = useState(true);

    if (!data || data.length === 0) {
        return null;
    }

    const Data1 = data.map((item) => parseInt(item.power));
    const Data2 = data.map((item) => parseInt(item.humi));
    const dates = data.map((item) => item.date);
    const seriesData = [
        {
            name: unit1,
            type: 'column',
            data: Data1,
        },
        {
            name: unit2,
            type: 'line',
            data: Data2,
        },
    ];

    const options = {
        chart: {
            type: 'line',
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: zoomEnabled,
            },
        },
        stroke: {
            width: [0, 2],
        },
        title: {
            text: update === 'en' ? 'General Statistics' : 'Thống kê chung',
        },
        dataLabels: {
            enabled: true,
            enabledOnSeries: [1],
        },
        labels: dates,

        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#999999',
                },
            },
        },
        yaxis: [
            {
                title: {
                    text: unit1,
                },
                labels: {
                    style: {
                        colors: '#999999',
                    },
                },
            },
            {
                opposite: true,
                title: {
                    text: unit2,
                },
            },
        ],
        plotOptions: {
            bar: {
                columnWidth: '50%',
            },
        },
    };

    const handleResetZoom = () => {
        setZoomEnabled(false); // Tạm thời vô hiệu hóa zoom
        setTimeout(() => {
            setZoomEnabled(true); // Kích hoạt lại zoom sau một khoảng thời gian ngắn
        }, 50);
    };

    return (
        <Card className="card-chart">
            <CardHeader>
                <Row>
                    <Col>
                        <div className="d-flex justify-content-between ">
                            <h5 className="card-category">
                                {update === 'en'
                                    ? `Update at ${data?.[data.length - 1]?.date}`
                                    : `Cập nhật lúc ${data?.[data.length - 1]?.date}`}
                            </h5>
                            <span
                                style={{
                                    fontSize: '1.3rem',
                                    cursor: 'pointer',
                                }}
                                className="material-icons float-right"
                                onClick={handleResetZoom}
                            >
                                zoom_out_map
                            </span>
                        </div>
                        <CardTitle tag="h3">
                            <i className="tim-icons icon-bell-55 text-info" />{' '}
                            {name}
                        </CardTitle>
                    </Col>
                </Row>
            </CardHeader>
            <CardBody>
                <div className="chart-area" style={{ height: '400px' }}>
                    <ReactApexChart
                        options={options}
                        series={seriesData}
                        type="line"
                        height={350}
                    />
                </div>
            </CardBody>
        </Card>
    );
};

export default ChartColumnAndLine;
