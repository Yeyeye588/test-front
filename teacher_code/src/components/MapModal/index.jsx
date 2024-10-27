/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable no-undef */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Map as A_Map, Marker as AMarker } from 'react-amap';
import { Map as B_Map, Marker as BMarker, AutoComplete } from 'react-bmapgl';
import { Modal, Input, message, Spin } from 'antd';
import { useModel } from '@umijs/max';
import { useModalParams } from '@/utils/hooks';

const MapModal = React.memo(
  forwardRef(
    (
      {
        onOk = () => {},
        type = 'amap', // amap：高德地图；bmap：百度地图
      },
      ref,
    ) => {
      useImperativeHandle(ref, () => ({
        showModal: () => handleOpen(),
      }));

      const { initialState } = useModel('@@initialState');
      const { settings } = initialState;

      const modalParams = useModalParams();
      const [inputValue, setInputValue] = useState('');
      const [position, setPosition] = useState({}); // 地图的经纬度
      const [markerPosition, setMarkerPosition] = useState({}); // 地图的经纬度
      const [mapInstance, setMapInstance] = useState(); // 地图信息
      const [loading, setLoading] = useState(false);

      const handleOpen = () => {
        modalParams.showModal({
          modalProps: {
            title: '请选择地址',
          },
        });
        if (type === 'bmap') {
          getCurrentLocation();
        }
      };

      const handleClose = () => {
        setInputValue('');
        setPosition({});
        setMarkerPosition({});
        modalParams.hideModal();
      };

      const handleSubmit = () => {
        onOk(markerPosition);
        handleClose();
      };

      // 高德地图 - 拖拽Marker后获取经纬度
      const dragendMarker = (e) => {
        const { Q, R } = e.lnglat;
        setMarkerPosition({
          longitude: R,
          latitude: Q,
        });
      };

      // 高德地图 - 通过经纬度获取地址
      const getGeocoder = (AMap) => {
        AMap.plugin('AMap.Geocoder', () => {
          const geocoder = new AMap.Geocoder({
            city: '全国',
          });
          // 逆向地理编码
          geocoder.getAddress(
            [markerPosition?.longitude, markerPosition?.latitude],
            (status, result) => {
              if (status === 'complete' && result.info === 'OK') {
                setInputValue(result.regeocode.formattedAddress);
              }
            },
          );
        });
      };

      // 高德地图 - 展示使用者当前所在城市
      const citySearch = (AMap) => {
        AMap.plugin('AMap.CitySearch', () => {
          const citySearch = new AMap.CitySearch();
          citySearch.getLocalCity((status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              const { rectangle } = result;
              // 根据模糊经纬度计算中心点
              const longitude =
                (Number(rectangle.split(';')[0].split(',')[0]) +
                  Number(rectangle.split(';')[1].split(',')[0])) /
                2;
              const latitude =
                (Number(rectangle.split(';')[0].split(',')[1]) +
                  Number(rectangle.split(';')[1].split(',')[1])) /
                2;
              setPosition({
                longitude,
                latitude,
              });
              setMarkerPosition({
                longitude,
                latitude,
              });
            }
          });
        });
      };

      // 高德地图 - 输入联想提示
      const inputTip = (AMap) => {
        AMap.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], () => {
          const autoOptions = {
            city: '', // 城市，默认全国
            input: 'keyword', // 使用联想输入的input的id
          };
          const autocomplete = new AMap.Autocomplete(autoOptions);
          AMap.event.addListener(autocomplete, 'select', (e) => {
            setInputValue(e.poi.name);
            if (e?.poi?.location?.lng && e?.poi?.location?.lat) {
              const {
                location: { lat, lng },
              } = e.poi;
              setPosition({
                longitude: lng,
                latitude: lat,
              });
              setMarkerPosition({
                longitude: lng,
                latitude: lat,
              });
            } else {
              message.error('无法获取当前选择地点经纬度，请重新输入!');
            }
          });
        });
      };

      //  高德地图 - 获取地图中心位置
      const showCenter = () => {
        if (mapInstance) {
          const { R, Q } = mapInstance.getCenter();
          setPosition({
            longitude: R,
            latitude: Q,
          });
          setMarkerPosition({
            longitude: R,
            latitude: Q,
          });
        }
      };

      // 百度地图 - 获取当前位置经纬度
      const getCurrentLocation = () => {
        const geolocation = new BMapGL.Geolocation();
        setLoading(true);
        geolocation.getCurrentPosition(function (result) {
          if (result?.longitude && result?.latitude) {
            setLoading(false);
            setPosition({
              longitude: result?.longitude,
              latitude: result?.latitude,
            });
            setMarkerPosition({
              longitude: result?.longitude,
              latitude: result?.latitude,
            });
            getAddressByPoint({
              longitude: result?.longitude,
              latitude: result?.latitude,
            });
          }
        });
      };

      // 百度地图 - 地址解析
      const getPositionByAddress = (address) => {
        const myGeo = new BMapGL.Geocoder();
        myGeo.getPoint(address, function (point) {
          if (point) {
            setPosition({
              longitude: point?.lng,
              latitude: point?.lat,
            });
            setMarkerPosition({
              longitude: point?.lng,
              latitude: point?.lat,
            });
          } else {
            message.error('您选择的地址没有解析到结果！');
          }
        });
      };

      // 百度地图 - 逆地址解析
      const getAddressByPoint = (point) => {
        // 创建地理编码实例
        const myGeo = new BMapGL.Geocoder();
        // 根据坐标得到地址描述
        myGeo.getLocation(new BMapGL.Point(point.longitude, point.latitude), function (result) {
          if (result) {
            setInputValue(result.address);
            changeListDisplay('hidden');
          }
        });
      };

      // 百度地图 - 控制提示列表显隐
      const changeListDisplay = (type) => {
        const listDom = document.getElementsByClassName('tangram-suggestion')[0];

        if (listDom) {
          listDom.style.display = type === 'show' ? 'block' : 'none';
        }
      };

      useEffect(() => {
        if (markerPosition?.longitude && markerPosition?.latitude) {
          if (type === 'amap') {
            getGeocoder(AMap);
          }
        }
      }, [markerPosition]);

      return (
        <Modal
          {...modalParams.modalProps}
          title={modalParams.params?.modalProps?.title}
          onOk={handleSubmit}
          onCancel={handleClose}
          okText="确定"
        >
          {type === 'amap' ? (
            // 高德地图
            <>
              <Input
                placeholder="请输入地址"
                id="keyword"
                style={{ marginBottom: 20, width: '100%' }}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
              />
              <div style={{ width: '100%', height: '300px' }}>
                <A_Map
                  events={{
                    created: (map) => {
                      setMapInstance(map);
                      showCenter();
                      inputTip(AMap);
                      citySearch(AMap);
                    },
                    moveend: () => {
                      setTimeout(() => {
                        showCenter();
                      }, 500);
                    },
                  }}
                  zoom={15}
                  customLayer={true}
                  amapkey={settings.AMAP_CONFIG.amapkey}
                  draggable={true}
                  center={position}
                >
                  <AMarker
                    position={markerPosition}
                    style={{ width: 19, height: 33 }}
                    events={{
                      dragend: (e) => {
                        dragendMarker(e);
                      },
                    }}
                    draggable={true}
                  />
                </A_Map>
              </div>
            </>
          ) : (
            // 百度地图
            <>
              <Input
                id="ac"
                placeholder="请输入地址"
                style={{ marginBottom: 20, width: '100%' }}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  changeListDisplay('show');
                }}
              />
              {document.getElementById('ac') && (
                <AutoComplete
                  input="ac"
                  onConfirm={(e) => {
                    const value = e.item.value;
                    const result = `${value?.city}${value?.district}${value?.business}`;
                    setInputValue(value?.business);
                    getPositionByAddress(result);
                    changeListDisplay('hidden');
                  }}
                />
              )}
              <Spin spinning={loading}>
                <B_Map
                  style={{ width: '100%', height: '300px' }}
                  center={new BMapGL.Point(position?.longitude, position?.latitude)}
                  zoom={16}
                  enableScrollWheelZoom
                  onClick={(e) => {
                    setMarkerPosition({
                      longitude: e.latlng.lng,
                      latitude: e.latlng.lat,
                    });

                    getAddressByPoint({
                      longitude: e.latlng.lng,
                      latitude: e.latlng.lat,
                    });
                  }}
                >
                  <BMarker
                    position={{ lng: markerPosition?.longitude, lat: markerPosition?.latitude }}
                  />
                </B_Map>
              </Spin>
            </>
          )}
        </Modal>
      );
    },
  ),
);
export default MapModal;
