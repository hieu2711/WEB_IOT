import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

const RoundChart = ({ data, number, update, name }) => {
    const [series, setSeries] = useState([]);

    useEffect(() => {
        if (number !== undefined) {
            setSeries([number]);
        }
    }, [number]);
    const [options] = useState({
        chart: {
            type: 'radialBar',
            offsetY: -20,
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: '#e7e7e7',
                    margin: 5,
                    dropShadow: {
                        enabled: true,
                        top: 2,
                        left: 0,
                        color: '#999',
                        opacity: 1,
                        blur: 2,
                    },
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        offsetY: -2,
                        fontSize: '22px',
                        color: '#F0E68C',
                    },
                },
            },
        },
        grid: {
            padding: {
                top: -10,
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark', // Loại bóng
                shadeIntensity: 0.4,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 50, 53, 91],
                colorStops: [{ offset: 0, color: '#3CB371' }],
            },
        },
        labels: ['Average Results'],
    });
    return (
        <Card className="card-chart">
            <CardHeader>
                <h5 className="card-category">
                    {update === 'en'
                        ? `Update at ${data?.[data.length - 1]?.date}`
                        : `Cập nhật lúc ${data?.[data.length - 1]?.date}`}
                </h5>
                <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" />
                    {name}
                </CardTitle>
            </CardHeader>
            <CardBody>
                <div className="chart-area">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="radialBar"
                    />
                    <div id="html-dist"></div>
                </div>
            </CardBody>
        </Card>
    );
};

export default RoundChart;
